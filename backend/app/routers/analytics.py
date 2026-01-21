from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db, get_mongo_db
from typing import Dict, Any, List

router = APIRouter()

@router.get("/stats/sql")
async def get_sql_stats(db: AsyncSession = Depends(get_db)):
    """
    Complex SQL Aggregation (OLAP):
    Distribution of genes per chromosome and average sequence length.
    """
    query = text("""
        SELECT 
            chromosome, 
            COUNT(*) as gene_count, 
            CAST(AVG(sequence_length) AS INTEGER) as avg_length
        FROM gene_metadata 
        GROUP BY chromosome 
        HAVING COUNT(*) > 0
        ORDER BY gene_count DESC
    """)
    result = await db.execute(query)
    rows = result.fetchall()
    
    return [
        {"chromosome": row[0], "count": row[1], "avg_length": row[2]} 
        for row in rows
    ]

@router.get("/stats/nosql")
async def get_nosql_stats(mongo_db = Depends(get_mongo_db)):
    """
    Complex NoSQL Aggregation (OLAP):
    Histogram of GC Content distribution using MongoDB Aggregation Pipeline.
    """
    pipeline = [
        {
            "$bucket": {
                "groupBy": "$gc_content",
                "boundaries": [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                "default": "Other",
                "output": {
                    "count": { "$sum": 1 }
                }
            }
        }
    ]
    
    results = await mongo_db.gene_data.aggregate(pipeline).to_list(length=None)
    
    # Format for chart (Recharts friendly)
    formatted = []
    for bucket in results:
        formatted.append({
            "range": f"{bucket['_id']}-{bucket['_id']+10}%",
            "count": bucket["count"],
            "bucket_start": bucket["_id"]
        })
        
    # Sort by bucket logical order
    formatted.sort(key=lambda x: x["bucket_start"])
    return formatted
