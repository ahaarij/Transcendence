#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Transcendence Backend - Docker Development Environment${NC}\n"

case "$1" in
  start)
    echo -e "${GREEN}Starting development container...${NC}"
    docker-compose -f docker-compose.dev.yml up -d
    echo -e "\n${GREEN}✅ Container started!${NC}"
    echo "Run './dev.sh shell' to enter the container"
    ;;
    
  stop)
    echo -e "${GREEN}Stopping development container...${NC}"
    docker-compose -f docker-compose.dev.yml down
    echo -e "${GREEN}✅ Container stopped!${NC}"
    ;;
    
  shell|bash)
    echo -e "${GREEN}Opening shell in container...${NC}"
    docker exec -it transcendence-backend-dev /bin/bash
    ;;
    
  logs)
    echo -e "${GREEN}Showing logs...${NC}"
    docker-compose -f docker-compose.dev.yml logs -f
    ;;
    
  restart)
    echo -e "${GREEN}Restarting container...${NC}"
    docker-compose -f docker-compose.dev.yml restart
    echo -e "${GREEN}✅ Container restarted!${NC}"
    ;;
    
  rebuild)
    echo -e "${GREEN}Rebuilding and starting container...${NC}"
    docker-compose -f docker-compose.dev.yml up -d --build
    echo -e "${GREEN}✅ Container rebuilt and started!${NC}"
    ;;
    
  npm)
    shift
    echo -e "${GREEN}Running npm command in container...${NC}"
    docker exec -it transcendence-backend-dev npm "$@"
    ;;
    
  prisma)
    shift
    echo -e "${GREEN}Running prisma command in container...${NC}"
    docker exec -it transcendence-backend-dev npx prisma "$@"
    ;;
    
  *)
    echo "Usage: ./dev.sh {start|stop|shell|logs|restart|rebuild|npm|prisma}"
    echo ""
    echo "Commands:"
    echo "  start    - Start the development container"
    echo "  stop     - Stop the development container"
    echo "  shell    - Open bash shell in container"
    echo "  logs     - Show container logs"
    echo "  restart  - Restart the container"
    echo "  rebuild  - Rebuild and restart container"
    echo "  npm      - Run npm commands (e.g., ./dev.sh npm install)"
    echo "  prisma   - Run prisma commands (e.g., ./dev.sh prisma studio)"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh start           # Start container"
    echo "  ./dev.sh shell           # Get interactive terminal"
    echo "  ./dev.sh npm install     # Install packages"
    echo "  ./dev.sh npm start       # Start the server"
    echo "  ./dev.sh prisma studio   # Open Prisma Studio"
    exit 1
    ;;
esac
