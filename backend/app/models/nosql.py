from pydantic import BaseModel, Field
from typing import Optional, Dict

class GeneMetadata(BaseModel):
    biotype: str
    chromosome: str

class GeneData(BaseModel):
    id: str = Field(..., alias="_id")
    experiment_id: int
    gene_symbol: str
    sequence_snippet: str
    expression_score: float
    gc_content: float
    metadata: GeneMetadata
    timestamp: str

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "gene_symbol": "ABC1",
                "expression_score": 85.5,
                "metadata": {"biotype": "protein_coding", "chromosome": "X"}
            }
        }
