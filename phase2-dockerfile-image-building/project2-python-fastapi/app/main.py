from fastapi import FastAPI
from app.routers import health
from app.models.response import MessageResponse
from datetime import datetime

app = FastAPI(
    title="FastAPI Demo",
    description="Production-ready FastAPI with Alpine Docker",
    version="1.0.0"
)

# Include routers
app.include_router(health.router, tags=["Health"])


@app.get("/", response_model=MessageResponse)
async def root():
    """
    Root endpoint - Welcome message
    
    Returns:
        MessageResponse: Welcome message with metadata
    """
    return MessageResponse(
        message="Welcome to FastAPI with Alpine Docker! ",
        version="1.0.0",
        timestamp=datetime.utcnow().isoformat()
    )


@app.get("/api/info")
async def info():
    """
    API information endpoint
    
    Returns:
        dict: API metadata and available endpoints
    """
    return {
        "name": "FastAPI Demo API",
        "version": "1.0.0",
        "framework": "FastAPI",
        "python_version": "3.11",
        "server": "uvicorn",
        "base_image": "python:3.11-alpine",
        "docs": "/docs",
        "redoc": "/redoc"
    }