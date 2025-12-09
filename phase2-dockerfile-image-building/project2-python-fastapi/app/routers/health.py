from fastapi import APIRouter
from app.models.response import HealthResponse
import time

router = APIRouter()

# Track startup time
startup_time = time.time()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint for monitoring and load balancers
    
    Returns:
        HealthResponse: Current health status with uptime
    """
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        uptime=time.time() - startup_time
    )