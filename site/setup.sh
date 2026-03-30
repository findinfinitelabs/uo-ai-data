#!/usr/bin/env bash

#####################################################################
# UO AI Data Class - Student Setup Script
#
# This script helps students set up their development environment
# for the UO AI Data Class.
#
# Platform Support:
#   - macOS: Native support
#   - Linux: Native support
#   - Windows: Use WSL2 (Windows Subsystem for Linux)
#
# Usage: ./setup.sh [OPTIONS]
#
# Options:
#   --all          Install everything (Python + Node.js dependencies)
#   --python       Install Python dependencies only
#   --node         Install Node.js dependencies only
#   --module-6     Include Module 6 (LLM training) dependencies
#   --help         Show this help message
#
# Windows Users:
#   This script requires WSL2 (Ubuntu recommended)
#   1. Install WSL2: wsl --install (in PowerShell as Admin)
#   2. Restart computer
#   3. Open Ubuntu from Start menu
#   4. Run this script inside Ubuntu
#####################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Default options
INSTALL_PYTHON=false
INSTALL_NODE=false
INSTALL_MODULE_6=false

# Parse arguments
if [ $# -eq 0 ]; then
    INSTALL_PYTHON=true
    INSTALL_NODE=true
fi

for arg in "$@"; do
    case $arg in
        --all)
            INSTALL_PYTHON=true
            INSTALL_NODE=true
            ;;
        --python)
            INSTALL_PYTHON=true
            ;;
        --node)
            INSTALL_NODE=true
            ;;
        --module-6)
            INSTALL_MODULE_6=true
            INSTALL_PYTHON=true
            ;;
        --help)
            echo "UO AI Data Class - Setup Script"
            echo ""
            echo "Usage: ./setup.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --all          Install everything (default if no options)"
            echo "  --python       Install Python dependencies only"
            echo "  --node         Install Node.js dependencies only"
            echo "  --module-6     Include Module 6 LLM training dependencies (~5-10GB)"
            echo "  --help         Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./setup.sh                    # Install Python + Node.js (no Module 6)"
            echo "  ./setup.sh --python           # Python only"
            echo "  ./setup.sh --all --module-6   # Everything including LLM training"
            exit 0
            ;;
    esac
done

echo -e "${BOLD}${CYAN}========================================${NC}"
echo -e "${BOLD}${CYAN}UO AI Data Class - Setup${NC}"
echo -e "${BOLD}${CYAN}========================================${NC}"
echo ""

# Detect if running in Windows (not WSL)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
    echo -e "${RED}${BOLD}⚠️  WINDOWS DETECTED${NC}"
    echo -e "${YELLOW}This script must be run in WSL2 (Windows Subsystem for Linux), not Git Bash, PowerShell, or CMD.${NC}"
    echo ""
    echo -e "${CYAN}To install WSL2:${NC}"
    echo -e "  1. Open PowerShell as Administrator"
    echo -e "  2. Run: ${BOLD}wsl --install${NC}"
    echo -e "  3. Restart your computer"
    echo -e "  4. Open Ubuntu from Start menu"
    echo -e "  5. Run this script again inside Ubuntu"
    echo ""
    echo -e "${CYAN}Alternatively, for Python-only setup on Windows:${NC}"
    echo -e "  1. Open PowerShell"
    echo -e "  2. Run: ${BOLD}python -m venv venv${NC}"
    echo -e "  3. Run: ${BOLD}.\\venv\\Scripts\\Activate.ps1${NC}"
    echo -e "  4. Run: ${BOLD}pip install -r requirements.txt${NC}"
    echo ""
    exit 1
fi

# Detect WSL and show helpful info
if grep -qi microsoft /proc/version 2>/dev/null; then
    echo -e "${GREEN}✓ Running in WSL2${NC}"
    echo ""
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check Python
echo -e "${BLUE}Checking Python installation...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 not found${NC}"
    echo -e "${YELLOW}Please install Python 3.10+ from https://python.org${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | awk '{print $2}')
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 10 ]); then
    echo -e "${RED}✗ Python $PYTHON_VERSION found, but 3.10+ required${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python $PYTHON_VERSION${NC}"

# Check Node.js (if needed)
if [ "$INSTALL_NODE" = true ]; then
    echo -e "${BLUE}Checking Node.js installation...${NC}"
    if ! command -v node &> /dev/null; then
        echo -e "${RED}✗ Node.js not found${NC}"
        echo -e "${YELLOW}Please install Node.js 18+ from https://nodejs.org${NC}"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | sed 's/^v//')
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
    
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo -e "${RED}✗ Node.js v$NODE_VERSION found, but v18+ required${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Node.js v$NODE_VERSION${NC}"
fi

echo ""

# Install Python dependencies
if [ "$INSTALL_PYTHON" = true ]; then
    echo -e "${BOLD}${CYAN}Installing Python dependencies...${NC}"
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo -e "${BLUE}Creating virtual environment...${NC}"
        python3 -m venv venv
        echo -e "${GREEN}✓ Virtual environment created${NC}"
    else
        echo -e "${YELLOW}Virtual environment already exists${NC}"
    fi
    
    # Activate virtual environment
    echo -e "${BLUE}Activating virtual environment...${NC}"
    source venv/bin/activate
    
    # Upgrade pip
    echo -e "${BLUE}Upgrading pip...${NC}"
    pip install --upgrade pip setuptools wheel
    
    # Install base requirements
    echo -e "${BLUE}Installing base requirements...${NC}"
    pip install -r requirements.txt
    echo -e "${GREEN}✓ Base Python dependencies installed${NC}"
    
    # Install Module 6 if requested
    if [ "$INSTALL_MODULE_6" = true ]; then
        echo ""
        echo -e "${YELLOW}${BOLD}Installing Module 6 (LLM Training) dependencies...${NC}"
        echo -e "${YELLOW}This may take 10-20 minutes and download 5-10GB${NC}"
        echo -e "${YELLOW}Press Ctrl+C to skip or wait 5 seconds to continue...${NC}"
        sleep 5
        
        if [ -f "module-6-llm-training/requirements.txt" ]; then
            pip install -r module-6-llm-training/requirements.txt
            echo -e "${GREEN}✓ Module 6 dependencies installed${NC}"
        else
            echo -e "${RED}✗ module-6-llm-training/requirements.txt not found${NC}"
        fi
    fi
    
    echo ""
    echo -e "${GREEN}${BOLD}Python setup complete!${NC}"
    echo -e "${CYAN}To activate the virtual environment later, run:${NC}"
    echo -e "${BOLD}  source venv/bin/activate${NC}"
    echo ""
fi

# Install Node.js dependencies
if [ "$INSTALL_NODE" = true ]; then
    echo -e "${BOLD}${CYAN}Installing Node.js dependencies...${NC}"
    
    if [ -d "react-guide" ]; then
        cd react-guide
        
        if [ ! -d "node_modules" ]; then
            echo -e "${BLUE}Installing React app dependencies...${NC}"
            npm install
            echo -e "${GREEN}✓ Node.js dependencies installed${NC}"
        else
            echo -e "${YELLOW}Node modules already installed${NC}"
            echo -e "${BLUE}Updating dependencies...${NC}"
            npm install
            echo -e "${GREEN}✓ Dependencies updated${NC}"
        fi
        
        cd ..
        
        echo ""
        echo -e "${GREEN}${BOLD}Node.js setup complete!${NC}"
        echo -e "${CYAN}To start the React app, run:${NC}"
        echo -e "${BOLD}  cd react-guide && npm run dev${NC}"
        echo ""
    else
        echo -e "${RED}✗ react-guide directory not found${NC}"
    fi
fi

# Summary
echo -e "${BOLD}${CYAN}========================================${NC}"
echo -e "${BOLD}${CYAN}Setup Summary${NC}"
echo -e "${BOLD}${CYAN}========================================${NC}"
echo ""

if [ "$INSTALL_PYTHON" = true ]; then
    echo -e "${GREEN}✓ Python dependencies installed${NC}"
    if [ "$INSTALL_MODULE_6" = true ]; then
        echo -e "${GREEN}✓ Module 6 (LLM training) installed${NC}"
    fi
fi

if [ "$INSTALL_NODE" = true ]; then
    echo -e "${GREEN}✓ Node.js dependencies installed${NC}"
fi

echo ""
echo -e "${BOLD}Next Steps:${NC}"
echo ""

if [ "$INSTALL_PYTHON" = true ]; then
    echo -e "${CYAN}1. Activate Python environment:${NC}"
    if grep -qi microsoft /proc/version 2>/dev/null; then
        # Running in WSL
        echo -e "   ${BOLD}source venv/bin/activate${NC}"
    else
        # Running on macOS/Linux
        echo -e "   ${BOLD}source venv/bin/activate${NC}"
    fi
    echo ""
    echo -e "${YELLOW}   Note for Windows (outside WSL):${NC}"
    echo -e "   PowerShell: ${BOLD}.\\venv\\Scripts\\Activate.ps1${NC}"
    echo -e "   CMD:        ${BOLD}venv\\Scripts\\activate.bat${NC}"
    echo ""
    echo -e "${CYAN}2. Generate synthetic data (Module 5):${NC}"
    echo -e "   ${BOLD}python module-5-synthetic-data/generators/generate_patient_data.py${NC}"
    echo ""
fi

if [ "$INSTALL_NODE" = true ]; then
    echo -e "${CYAN}3. Start the React guide app:${NC}"
    echo -e "   ${BOLD}cd react-guide && npm run dev${NC}"
    echo -e "   ${YELLOW}Note: Works on all platforms (macOS/Linux/Windows)${NC}"
    echo ""
fi

echo -e "${CYAN}4. Review system requirements:${NC}"
echo -e "   ${BOLD}cat SYSTEM-REQUIREMENTS.md${NC}"
echo ""

echo -e "${GREEN}${BOLD}Setup complete! Happy learning! 🎓${NC}"
