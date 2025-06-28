"""
AI Chat Desktop Backend - FastAPI Application
Main entry point for the Python backend service.
"""

import os
import sys
import signal
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
from api.agent_routes import router as agent_router
from api.app_setting_routes import router as app_setting_router
from models.schemas import ErrorResponse
from database.connection import init_database, test_database_connection, get_database_info
from database.config_loader import config_loader


# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Changed to DEBUG for more detailed output
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("backend.log")
    ]
)
logger = logging.getLogger(__name__)

# Also set uvicorn logger to DEBUG
uvicorn_logger = logging.getLogger("uvicorn")
uvicorn_logger.setLevel(logging.DEBUG)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("🚀 SampleStrands Backend starting up...")
    logger.info(f"📅 Startup time: {datetime.utcnow().isoformat()}")
    logger.info("🔧 Initializing services...")

    # Initialize database
    try:
        logger.info("🗄️ Initializing database...")
        init_database()

        # Test database connection
        if test_database_connection():
            logger.info("✅ Database connection successful")

            # Load configurations with version checking
            if not config_loader.is_database_initialized():
                logger.info("📋 Loading initial configurations...")
                config_loader.load_all_configurations(force_update=True)
            else:
                logger.info("📋 Checking for configuration updates...")
                config_loader.load_all_configurations(force_update=False)

            # Log database info
            db_info = get_database_info()
            logger.info(f"🗄️ Database info: {len(db_info.get('tables', []))} tables")

            # Initialize default app settings
            try:
                from services.app_setting_service import app_setting_service
                logger.info("🔧 Initializing default app settings...")
                await app_setting_service.initialize_default_settings()
                logger.info("✅ Default app settings initialized")
            except Exception as e:
                logger.error(f"❌ Failed to initialize default app settings: {str(e)}")

        else:
            logger.error("❌ Database connection failed")

    except Exception as e:
        logger.error(f"❌ Database initialization failed: {str(e)}")
        # Don't fail startup, but log the error

    # Initialize agent pool settings
    try:
        logger.info("🏊 Loading agent pool settings...")
        from services.llm_service import llm_service
        await llm_service.load_agent_pool_settings()
        logger.info("✅ Agent pool settings loaded")
    except Exception as e:
        logger.error(f"❌ Failed to load agent pool settings: {str(e)}")
        # Don't fail startup, use defaults

    logger.info("✅ Services initialized successfully")

    yield

    # Shutdown
    logger.info("🛑 AI Chat Desktop Backend shutting down...")
    logger.info("🧹 Cleaning up resources...")
    logger.info("✅ Shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="SampleStrands Backend",
    description="Python backend service for SampleStrands application using AWS Bedrock and Strands Agent SDK",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # Next.js dev server
        "http://127.0.0.1:3000",   # Next.js dev server (alternative)
        "file://",                 # Electron app
        "http://localhost:*",      # Any localhost port
        "http://127.0.0.1:*",     # Any 127.0.0.1 port
        "*"                        # Allow all origins for development
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
    
    error_response = ErrorResponse(
        error="Internal Server Error",
        message="An unexpected error occurred. Please try again later.",
        timestamp=datetime.utcnow()
    )

    return JSONResponse(
        status_code=500,
        content=error_response.model_dump(mode='json')
    )


# HTTP exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handler for HTTP exceptions."""
    logger.warning(f"HTTP exception: {exc.status_code} - {exc.detail}")
    
    error_response = ErrorResponse(
        error=f"HTTP {exc.status_code}",
        message=exc.detail,
        timestamp=datetime.utcnow()
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump(mode='json')
    )


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests with detailed information."""
    start_time = datetime.utcnow()

    # Extract request details
    client_ip = request.client.host if request.client else 'unknown'
    user_agent = request.headers.get('user-agent', 'unknown')
    content_type = request.headers.get('content-type', 'none')

    # Log detailed request information
    logger.info(f"📥 {request.method} {request.url.path}")
    logger.debug(f"   🔍 Client: {client_ip}")
    logger.debug(f"   🔍 User-Agent: {user_agent}")
    logger.debug(f"   🔍 Content-Type: {content_type}")

    if request.query_params:
        logger.debug(f"   🔍 Query Params: {dict(request.query_params)}")

    # Log request body for POST/PUT requests (be careful with sensitive data)
    if request.method in ["POST", "PUT", "PATCH"]:
        try:
            # Read body without consuming it
            body = await request.body()
            if body:
                # Only log first 500 characters to avoid huge logs
                body_str = body.decode('utf-8')[:500]
                logger.debug(f"   🔍 Request Body: {body_str}{'...' if len(body) > 500 else ''}")
        except Exception as e:
            logger.debug(f"   ⚠️ Could not read request body: {e}")

    # Process request
    response = await call_next(request)

    # Log response details
    process_time = (datetime.utcnow() - start_time).total_seconds()
    logger.info(f"📤 {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.3f}s")

    # Log slow requests
    if process_time > 1.0:
        logger.warning(f"🐌 Slow request detected: {process_time:.3f}s for {request.method} {request.url.path}")

    return response


# Include API routes
app.include_router(router, prefix="/api/v1")
app.include_router(agent_router, prefix="/api/v1")
app.include_router(app_setting_router, prefix="/api/v1")


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "service": "SampleStrands Backend",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "docs": "/docs",
        "health": "/api/v1/health",
        "description": "Python backend service for SampleStrands application"
    }


# Health check endpoint (also available at root level)
@app.get("/health")
async def health():
    """Simple health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "SampleStrands Backend"
    }


def signal_handler(signum, frame):
    """Handle shutdown signals gracefully."""
    logger.info(f"🛑 Received signal {signum}, shutting down gracefully...")
    sys.exit(0)


def main():
    """Main function to run the server."""
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Configuration
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 3867))
    debug = os.getenv("DEBUG", "false").lower() == "true"

    logger.info(f"🌐 Starting server on {host}:{port}")
    logger.info(f"🔧 Debug mode: {debug}")
    logger.info(f"📚 API documentation available at: http://{host}:{port}/docs")
    logger.info("🔧 Signal handlers registered for graceful shutdown")
    
    # Run the server
    # Note: Disable reload to prevent issues with Electron process management
    logger.info("🚀 About to start uvicorn server...")
    try:
        # Use app object directly instead of string import for PyInstaller compatibility
        uvicorn.run(
            app,  # Pass app object directly instead of "main:app"
            host=host,
            port=port,
            reload=False,  # Always disable reload for stability
            log_level="info" if not debug else "debug",
            access_log=True
        )
    except Exception as e:
        logger.error(f"❌ Server failed to start: {e}")
        raise
    finally:
        logger.info("🛑 Server has stopped")


if __name__ == "__main__":
    main()
