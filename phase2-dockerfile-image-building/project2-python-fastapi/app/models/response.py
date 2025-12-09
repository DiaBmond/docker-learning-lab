from pydantic import BaseModel
from typing import Dict, Any


class HealthResponse(BaseModel):
    status: str
    version: str
    uptime: float


class MessageResponse(BaseModel):
    message: str
    version: str
    timestamp: str


class DetailResponse(BaseModel):
    detail: Dict[str, Any]