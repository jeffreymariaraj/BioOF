from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db, get_mongo_db
from app.models.sql import Project, Experiment
from app.models.nosql import GeneData
from typing import List, Dict, Any

router = APIRouter()

@router.get("/hybrid-query", response_model=Dict[str, Any])
async def hybrid_query(
    project_id: int, 
    min_score: float, 
    db: AsyncSession = Depends(get_db),
    mongo_db = Depends(get_mongo_db)
):
    """
    Performs a Hybrid Join:
    1. Fetches Project and Experiment metadata from PostgreSQL (Structured).
    2. Uses experiment IDs to query MongoDB for high-scoring genes (Unstructured).
    3. Merges results in memory.
    """
    
    # 1. SQL Query: Validate Project and get Experiments
    # We query for the project and eagerly load experiments to avoid N+1
    result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = result.scalars().first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Fetch experiments for this project
    # In a real app we'd join, but let's be explicit
    exp_result = await db.execute(
        select(Experiment).where(Experiment.project_id == project_id)
    )
    experiments = exp_result.scalars().all()
    experiment_ids = [exp.id for exp in experiments]

    if not experiment_ids:
        return {
            "project": {"name": project.name, "id": project.id, "source": "[SQL]"},
            "results": []
        }

    # 2. NoSQL Query: Find High-Scoring Genes for these Experiments
    # We perform an 'IN' query on MongoDB
    gene_cursor = mongo_db.gene_data.find({
        "experiment_id": {"$in": experiment_ids},
        "expression_score": {"$gt": min_score}
    }).sort("expression_score", -1).limit(100) # Limit for pagination/performance

    nosql_results = []
    async for doc in gene_cursor:
        # Convert ObjectId to string
        doc["_id"] = str(doc["_id"])
        nosql_results.append(doc)

    # 3. Join / Shape Data
    # Enrich NoSQL data with SQL Experiment Names
    exp_map = {exp.id: exp.name for exp in experiments}
    
    final_results = []
    for gene in nosql_results:
        gene["experiment_name"] = exp_map.get(gene["experiment_id"], "Unknown")
        gene["source_tag"] = "[NoSQL]"
        final_results.append(gene)

    return {
        "project_metadata": {
            "name": project.name, 
            "description": project.description,
            "source": "[SQL]",
            "experiment_count": len(experiments)
        },
        "gene_data": final_results,
        "query_details": {
            "threshold": min_score,
            "match_count": len(final_results)
        }
    }
