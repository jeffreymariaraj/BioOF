from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db, get_mongo_db
from app.models.sql import Experiment
from typing import List, Dict, Any

router = APIRouter()

@router.get("/genes/recommend/{gene_id}")
async def recommend_similar_genes(
    gene_id: str, # Could be MongoDB ID or gene_symbol. Let's assume gene_symbol for MVP ease.
    db: AsyncSession = Depends(get_db),
    mongo_db = Depends(get_mongo_db)
):
    """
    Biologically Aware Search:
    Finds genes with similar feature vectors (Expression, GC, Complexity).
    Method: HNSW Index Search using Cosine Distance.
    """
    
    # 1. Get Target Vector (from SQL Metadata) based on Gene ID (which we'll map to symbol for now or ID)
    # Note: frontend sends Mongo ID. We need to match it. But wait, SQL 'gene_metadata' doesn't have Mongo ID.
    # It has 'gene_symbol'. Let's fetch the Symbol from Mongo first if ID is passed.
    
    try:
        from bson import ObjectId
        mongo_gene = await mongo_db.gene_data.find_one({"_id": ObjectId(gene_id)})
        if not mongo_gene:
            raise HTTPException(status_code=404, detail="Gene source not found")
        target_symbol = mongo_gene["gene_symbol"]
    except:
        raise HTTPException(status_code=400, detail="Invalid Gene ID")

    # 2. Vector Search in SQL
    # Fetch embedding of target
    
    # We select the embedding for the target gene
    # Then we find nearest neighbors.
    # We can do this in one query or two.
    
    query = text("""
        WITH target AS (
            SELECT embedding FROM gene_metadata WHERE gene_symbol = :symbol LIMIT 1
        )
        SELECT 
            gene_symbol,
            experiment_id,
            1 - (embedding <=> (SELECT embedding FROM target)) as similarity_score
        FROM gene_metadata 
        WHERE gene_symbol != :symbol
        ORDER BY embedding <=> (SELECT embedding FROM target)
        LIMIT 5;
    """)
    
    result = await db.execute(query, {"symbol": target_symbol})
    rows = result.fetchall()
    
    if not rows:
        return {"recommendations": []}

    recommendations = []
    
    # 3. Enrich with MongoDB Details (Hybrid Architecture!)
    for row in rows:
        symbol = row[0]
        score = row[2]
        
        # Fetch details from Mongo
        details = await mongo_db.gene_data.find_one({"gene_symbol": symbol})
        if details:
            details["_id"] = str(details["_id"])
            details["similarity_score"] = float(score)
            recommendations.append(details)

    return {
        "source_gene": target_symbol,
        "search_method": "HNSW Vector Index (Cosine Distance)",
        "recommendations": recommendations,
        "vector_status": "Enabled"
    }
