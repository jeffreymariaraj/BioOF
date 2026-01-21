import json
from redis.asyncio import Redis
from typing import Optional, Any

class CacheService:
    def __init__(self, redis: Redis):
        self.redis = redis
        self.ttl = 60 # 60 Seconds Cache Expiry

    async def get_gene(self, gene_id: str) -> Optional[dict]:
        """Try to fetch gene from Redis Cache"""
        data = await self.redis.get(f"gene:{gene_id}")
        if data:
            return json.loads(data)
        return None

    async def set_gene(self, gene_id: str, data: dict):
        """Store gene in Redis with TTL"""
        await self.redis.setex(
            f"gene:{gene_id}",
            self.ttl,
            json.dumps(data)
        )
