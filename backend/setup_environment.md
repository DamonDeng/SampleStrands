# Python Backend Environment Setup

## Prerequisites

1. **Install Conda**: Download and install Miniconda or Anaconda from https://conda.io/

## Environment Setup

### 1. Create Conda Environment

```bash
# Create the specific environment for this project
conda create -n for_sample_strands python=3.11 -y

# Activate the environment
conda activate for_sample_strands
```

### 2. Install Dependencies

```bash
# Navigate to the backend directory
cd backend

# Install Python packages
pip install -r requirements.txt
```

### 3. Verify Installation

```bash
# Test FastAPI installation
python -c "import fastapi; print('FastAPI installed successfully')"

# Test uvicorn installation
python -c "import uvicorn; print('Uvicorn installed successfully')"
```

## Running the Backend

### Development Mode

```bash
# Activate environment
conda activate for_sample_strands

# Start the server
uvicorn main:app --host 0.0.0.0 --port 3867 --reload
```

### Production Mode (used by Electron)

```bash
# Activate environment
conda activate for_sample_strands

# Start the server
uvicorn main:app --host 127.0.0.1 --port 3867
```

## Environment Variables (Optional)

Create a `.env` file in the backend directory:

```env
# Server configuration
HOST=127.0.0.1
PORT=3867
DEBUG=false

# AWS Configuration (for future Bedrock integration)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Logging
LOG_LEVEL=INFO
```

## Troubleshooting

### Common Issues

1. **Conda not found**: Make sure Conda is installed and added to PATH
2. **Environment activation fails**: Restart terminal after Conda installation
3. **Port 3867 in use**: Check if another service is using the port
4. **Import errors**: Ensure all dependencies are installed in the correct environment

### Verification Commands

```bash
# Check Python version
python --version

# Check installed packages
pip list

# Test server startup
python -c "import uvicorn; uvicorn.run('main:app', host='127.0.0.1', port=3867)"
```
