# Markdown Test Content

This is a comprehensive test of markdown features in the chat app.

## Headers

### Level 3 Header
#### Level 4 Header
##### Level 5 Header
###### Level 6 Header

## Text Formatting

**Bold text** and *italic text* and ***bold italic text***.

~~Strikethrough text~~

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

### Ordered List
1. First item
2. Second item
   1. Nested item 2.1
   2. Nested item 2.2
3. Third item

## Code

Inline `code` example.

### JavaScript/TypeScript
```javascript
// Modern JavaScript with ES6+ features
const greet = (name) => {
  console.log(`Hello, ${name}!`);
  return `Welcome to the chat app, ${name}`;
};

// Async/await example
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

greet("World");
```

```typescript
// TypeScript with interfaces and generics
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

class UserService<T extends User> {
  private users: T[] = [];

  constructor(private apiUrl: string) {}

  async getUser(id: number): Promise<T | null> {
    const user = this.users.find(u => u.id === id);
    return user || null;
  }

  addUser(user: T): void {
    this.users.push(user);
  }
}

const userService = new UserService<User>('/api/users');
```

### Python
```python
# Python with type hints and modern features
from typing import List, Optional, Dict, Any
import asyncio
import json

class FibonacciCalculator:
    """Calculate Fibonacci numbers with memoization."""

    def __init__(self):
        self._cache: Dict[int, int] = {0: 0, 1: 1}

    def calculate(self, n: int) -> int:
        """Calculate the nth Fibonacci number."""
        if n in self._cache:
            return self._cache[n]

        if n < 0:
            raise ValueError("n must be non-negative")

        result = self.calculate(n-1) + self.calculate(n-2)
        self._cache[n] = result
        return result

    def get_sequence(self, length: int) -> List[int]:
        """Get Fibonacci sequence of given length."""
        return [self.calculate(i) for i in range(length)]

# Usage example
calc = FibonacciCalculator()
sequence = calc.get_sequence(10)
print(f"First 10 Fibonacci numbers: {sequence}")

# Async example
async def process_data(data: List[Dict[str, Any]]) -> None:
    """Process data asynchronously."""
    tasks = [process_item(item) for item in data]
    await asyncio.gather(*tasks)

async def process_item(item: Dict[str, Any]) -> None:
    """Process a single item."""
    await asyncio.sleep(0.1)  # Simulate async work
    print(f"Processed: {item}")
```

### SQL
```sql
-- Complex SQL query with joins and aggregations
SELECT
    u.id,
    u.name,
    u.email,
    COUNT(o.id) as order_count,
    SUM(o.total_amount) as total_spent,
    AVG(o.total_amount) as avg_order_value
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
    AND u.is_active = true
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 100;

-- Create table with constraints
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) CHECK (price > 0),
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### JSON
```json
{
  "name": "chat-app",
  "version": "1.0.0",
  "description": "A modern chat application with AI integration",
  "main": "index.js",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "jest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "next": "^14.0.0",
    "react-markdown": "^9.0.0",
    "highlight.js": "^11.9.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0"
  },
  "keywords": ["chat", "ai", "react", "nextjs"],
  "author": "Your Name",
  "license": "MIT"
}
```

### CSS/SCSS
```css
/* Modern CSS with custom properties and grid */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.chat-container {
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  grid-template-rows: 60px 1fr;
  height: 100vh;
  font-family: var(--font-family);
}

.message-bubble {
  background: linear-gradient(135deg, var(--primary-color), #0056b3);
  border-radius: 18px;
  padding: 12px 16px;
  margin: 8px 0;
  max-width: 70%;
  word-wrap: break-word;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.message-bubble:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .chat-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
}
```

### YAML
```yaml
# Docker Compose configuration
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - API_URL=http://backend:8000
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - PYTHON_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/chatapp
    depends_on:
      - db
    volumes:
      - ./backend:/app

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: chatapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:

networks:
  default:
    driver: bridge
```

### Bash/Shell
```bash
#!/bin/bash

# Deployment script with error handling
set -euo pipefail

# Configuration
APP_NAME="chat-app"
DEPLOY_ENV="${1:-staging}"
BUILD_DIR="./build"
BACKUP_DIR="./backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
        exit 1
    fi

    log "Prerequisites check passed"
}

# Build application
build_app() {
    log "Building application for $DEPLOY_ENV..."

    # Install dependencies
    npm ci --production=false

    # Run tests
    npm run test

    # Build for production
    NODE_ENV=production npm run build

    log "Build completed successfully"
}

# Deploy application
deploy_app() {
    log "Deploying to $DEPLOY_ENV..."

    # Create backup
    if [ -d "$BUILD_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        cp -r "$BUILD_DIR" "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S)"
        log "Backup created"
    fi

    # Deploy based on environment
    case $DEPLOY_ENV in
        "production")
            deploy_production
            ;;
        "staging")
            deploy_staging
            ;;
        *)
            error "Unknown environment: $DEPLOY_ENV"
            exit 1
            ;;
    esac

    log "Deployment completed successfully"
}

# Main execution
main() {
    log "Starting deployment process for $APP_NAME"

    check_prerequisites
    build_app
    deploy_app

    log "Deployment process completed!"
}

# Run main function
main "$@"
```

## Links

[OpenAI](https://openai.com) - External link
[Internal link](#headers) - Internal link

## Blockquotes

> This is a blockquote.
> 
> It can span multiple lines and contain other markdown elements.
> 
> > Nested blockquotes are also supported.

## Tables

| Feature | Supported | Notes |
|---------|-----------|-------|
| Headers | ✅ | All levels 1-6 |
| Lists | ✅ | Ordered and unordered |
| Code | ✅ | Inline and blocks |
| Links | ✅ | Internal and external |
| Tables | ✅ | With alignment |
| Math | ✅ | LaTeX syntax |

## Math (LaTeX)

Inline math: $E = mc^2$

Block math:
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## Horizontal Rule

---

## Task Lists

- [x] Implement markdown rendering
- [x] Add syntax highlighting
- [x] Support math equations
- [ ] Add mermaid diagrams
- [ ] Add emoji support

## Special Characters

&copy; 2024 AI Chat Desktop
&trade; Markdown Support
&reg; Advanced Features

This concludes the markdown test content. All these features should render properly in the chat messages!
