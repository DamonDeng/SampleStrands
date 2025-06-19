"""
AI Chat Desktop Backend - FastAPI Application
Main entry point for the Python backend service.
"""

import os
import sys
import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from api.routes import router
from models.schemas import ErrorResponse


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("backend.log")
    ]
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("🚀 AI Chat Desktop Backend starting up...")
    logger.info(f"📅 Startup time: {datetime.utcnow().isoformat()}")
    logger.info("🔧 Initializing services...")
    
    # Initialize services here if needed
    logger.info("✅ Services initialized successfully")
    
    yield
    
    # Shutdown
    logger.info("🛑 AI Chat Desktop Backend shutting down...")
    logger.info("🧹 Cleaning up resources...")
    logger.info("✅ Shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="AI Chat Desktop Backend",
    description="Python backend service for AI Chat Desktop application using AWS Bedrock and Strands Agent SDK",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "file://",                # Electron app
        "http://localhost:*",     # Any localhost port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal Server Error",
            message="An unexpected error occurred. Please try again later.",
            timestamp=datetime.utcnow()
        ).dict()
    )


# HTTP exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handler for HTTP exceptions."""
    logger.warning(f"HTTP exception: {exc.status_code} - {exc.detail}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=f"HTTP {exc.status_code}",
            message=exc.detail,
            timestamp=datetime.utcnow()
        ).dict()
    )


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests."""
    start_time = datetime.utcnow()
    
    # Log request
    logger.info(f"📥 {request.method} {request.url.path} - Client: {request.client.host if request.client else 'unknown'}")
    
    # Process request
    response = await call_next(request)
    
    # Log response
    process_time = (datetime.utcnow() - start_time).total_seconds()
    logger.info(f"📤 {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.3f}s")
    
    return response


# Include API routes
app.include_router(router, prefix="/api/v1")


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "service": "AI Chat Desktop Backend",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "docs": "/docs",
        "health": "/api/v1/health",
        "description": "Python backend service for AI Chat Desktop application"
    }


# Health check endpoint (also available at root level)
@app.get("/health")
async def health():
    """Simple health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "AI Chat Desktop Backend"
    }


def main():
    """Main function to run the server."""
    # Configuration
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 3867))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    logger.info(f"🌐 Starting server on {host}:{port}")
    logger.info(f"🔧 Debug mode: {debug}")
    logger.info(f"📚 API documentation available at: http://{host}:{port}/docs")
    
    # Run the server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info" if not debug else "debug",
        access_log=True
    )


if __name__ == "__main__":
    main()
