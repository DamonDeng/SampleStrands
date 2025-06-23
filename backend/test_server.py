#!/usr/bin/env python3
"""
Test server for database migration testing - without LLM service dependencies.
"""

import logging
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from database.connection import init_database, test_database_connection, get_database_info
from database.config_loader import config_loader

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("🚀 Test Server starting up...")
    logger.info("🔧 Initializing database...")
    
    try:
        # Initialize database
        init_database()
        
        # Test database connection
        if test_database_connection():
            logger.info("✅ Database connection successful")
            
            # Load configurations if needed
            if not config_loader.is_database_initialized():
                logger.info("📋 Loading initial configurations...")
                config_loader.load_all_configurations()
            else:
                logger.info("📋 Database already initialized with configurations")
                
            # Log database info
            db_info = get_database_info()
            logger.info(f"🗄️ Database info: {len(db_info.get('tables', []))} tables")
            
        else:
            logger.error("❌ Database connection failed")
            
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {str(e)}")
    
    logger.info("✅ Test server initialized successfully")
    
    yield
    
    # Shutdown
    logger.info("🛑 Test server shutting down...")


# Create FastAPI app
app = FastAPI(
    title="AI Chat Desktop Backend - Test Server",
    description="Test server for database migration testing",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0-test",
        "services": {
            "database": "active",
            "agent_service": "active"
        }
    }


@app.get("/api/v1/models")
async def get_available_models():
    """Get list of available AI models."""
    from services.agent_service import agent_service

    logger.info("🔍 Retrieving available models")
    models = await agent_service.get_supported_models()
    logger.info(f"📋 Found {len(models)} available models")

    # Group models by category for better organization
    models_by_category = {}
    for model in models:
        category = getattr(model, 'category', 'other')
        if category not in models_by_category:
            models_by_category[category] = []
        models_by_category[category].append(model.dict())

    return {
        "models": [model.dict() for model in models],
        "models_by_category": models_by_category,
        "total": len(models)
    }


@app.get("/api/v1/models/{model_id}")
async def get_model_info(model_id: str):
    """Get information about a specific model."""
    from services.agent_service import agent_service

    logger.info(f"🔍 Retrieving model info: {model_id}")
    model = await agent_service.get_model_by_id(model_id)

    if not model:
        logger.warning(f"❌ Model not found: {model_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model {model_id} not found"
        )

    logger.info(f"✅ Model info retrieved: {model.model_name}")
    return {"model": model.dict()}


@app.get("/api/v1/tools")
async def get_available_tools():
    """Get list of available tools."""
    from services.agent_service import agent_service

    logger.info("🔍 Retrieving available tools")
    tools = await agent_service.get_supported_tools()
    logger.info(f"🔧 Found {len(tools)} available tools")

    # Group tools by category for better organization
    tools_by_category = {}
    for tool in tools:
        category = getattr(tool, 'category', 'other')
        if category not in tools_by_category:
            tools_by_category[category] = []
        tools_by_category[category].append(tool.dict())

    return {
        "tools": [tool.dict() for tool in tools],
        "tools_by_category": tools_by_category,
        "total": len(tools)
    }


@app.get("/api/v1/agents")
async def get_agents():
    """Get all agents."""
    from services.agent_service import agent_service

    logger.info("🔍 Retrieving all agents")
    agents = await agent_service.get_all_agents()
    logger.info(f"🤖 Found {len(agents)} agents")

    return {
        "agents": [agent.dict() for agent in agents],
        "total": len(agents)
    }


@app.post("/api/v1/agents")
async def create_agent(request: dict):
    """Create a new agent."""
    from services.agent_service import agent_service
    from models.schemas import AgentCreateRequest

    logger.info(f"🆕 Creating new agent")
    
    try:
        # Convert dict to AgentCreateRequest
        create_request = AgentCreateRequest(**request)
        agent = await agent_service.create_agent(create_request)
        
        logger.info(f"✅ Agent created: {agent.id}")
        return agent.dict()
        
    except Exception as e:
        logger.error(f"❌ Failed to create agent: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create agent: {str(e)}"
        )


@app.get("/api/v1/stats")
async def get_stats():
    """Get service statistics."""
    from services.agent_service import agent_service

    logger.info("📊 Retrieving service statistics")

    # Get agent statistics
    agents_summary = await agent_service.get_agents_summary()

    stats = {
        "service": "AI Chat Desktop Backend - Test Server",
        "uptime": "active",
        "agents": agents_summary,
        "supported_models": len(await agent_service.get_supported_models()),
        "supported_tools": len(await agent_service.get_supported_tools())
    }

    logger.info(f"✅ Service statistics retrieved")
    return stats


if __name__ == "__main__":
    import uvicorn
    
    logger.info("🚀 Starting test server...")
    uvicorn.run(
        "test_server:app",
        host="127.0.0.1",
        port=3867,
        reload=False,
        log_level="info"
    )
