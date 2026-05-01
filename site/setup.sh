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
#   - Windows: Native support (Git Bash / PowerShell) + WSL2
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
#   Run from Git Bash or PowerShell. WSL2 is still recommended for
#   Linux-native deployment tooling (kubectl/eksctl/docker workflows).
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

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Platform detection
IS_WINDOWS=false
IS_MACOS=false
IS_LINUX=false
IS_WSL=false
if [[ "$OSTYPE" == msys* || "$OSTYPE" == cygwin* || "$OSTYPE" == win32* ]]; then
    IS_WINDOWS=true
elif [[ "$OSTYPE" == darwin* ]]; then
    IS_MACOS=true
elif [[ "$OSTYPE" == linux* ]]; then
    IS_LINUX=true
fi

if [ "$IS_LINUX" = true ] && grep -qi microsoft /proc/version 2>/dev/null; then
    IS_WSL=true
fi

if [ "$IS_WSL" = true ]; then
    echo -e "${GREEN}✓ Running in WSL2${NC}"
    echo ""
elif [ "$IS_WINDOWS" = true ]; then
    echo -e "${GREEN}✓ Running on native Windows shell${NC}"
    echo -e "${YELLOW}Tip: WSL2 is still recommended for deployment scripts (AWS/EKS tooling).${NC}"
    echo ""
fi

find_winget() {
    if command -v winget >/dev/null 2>&1; then
        echo "winget"
        return 0
    fi
    if command -v winget.exe >/dev/null 2>&1; then
        echo "winget.exe"
        return 0
    fi
    return 1
}

# Ensure Homebrew is available on macOS (used for dependency bootstrapping)
ensure_homebrew() {
    if command -v brew >/dev/null 2>&1; then
        return 0
    fi

    if [ "$IS_MACOS" != true ]; then
        return 1
    fi

    echo -e "${YELLOW}Homebrew not found. Installing Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Add Homebrew to PATH for current shell session.
    if [ -x "/opt/homebrew/bin/brew" ]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [ -x "/usr/local/bin/brew" ]; then
        eval "$(/usr/local/bin/brew shellenv)"
    fi

    if ! command -v brew >/dev/null 2>&1; then
        echo -e "${RED}✗ Failed to initialize Homebrew in current shell${NC}"
        return 1
    fi

    echo -e "${GREEN}✓ Homebrew installed${NC}"
    return 0
}

find_supported_python() {
    local candidate
    for candidate in python3.13 python3.12 python3.11 python3.10 python3 python python.exe; do
        if command -v "$candidate" >/dev/null 2>&1; then
            local ver
            ver="$($candidate --version 2>/dev/null | awk '{print $2}')"
            local major
            local minor
            major="$(echo "$ver" | cut -d. -f1)"
            minor="$(echo "$ver" | cut -d. -f2)"
            if [ "$major" -gt 3 ] || { [ "$major" -eq 3 ] && [ "$minor" -ge 10 ]; }; then
                echo "$candidate"
                return 0
            fi
        fi
    done
    return 1
}

ensure_python() {
    if PYTHON_BIN="$(find_supported_python)"; then
        return 0
    fi

    if [ "$IS_MACOS" = true ]; then
        echo -e "${YELLOW}No supported Python (3.10+) found. Installing Python 3.11 with Homebrew...${NC}"
        ensure_homebrew || return 1
        brew install python@3.11

        # Make sure current shell can find brew binaries.
        if [ -x "/opt/homebrew/bin/brew" ]; then
            eval "$(/opt/homebrew/bin/brew shellenv)"
        elif [ -x "/usr/local/bin/brew" ]; then
            eval "$(/usr/local/bin/brew shellenv)"
        fi

        if command -v python3.11 >/dev/null 2>&1; then
            PYTHON_BIN="python3.11"
            return 0
        fi
    elif [ "$IS_WINDOWS" = true ]; then
        echo -e "${YELLOW}No supported Python (3.10+) found. Installing Python 3.11 via winget...${NC}"
        local winget_cmd
        if winget_cmd="$(find_winget)"; then
            "$winget_cmd" install -e --id Python.Python.3.11 --accept-source-agreements --accept-package-agreements || true
            hash -r
            if PYTHON_BIN="$(find_supported_python)"; then
                return 0
            fi
        fi
    fi

    return 1
}

ensure_node() {
    if command -v node >/dev/null 2>&1; then
        local node_version
        local node_major
        node_version="$(node --version | sed 's/^v//')"
        node_major="$(echo "$node_version" | cut -d. -f1)"
        if [ "$node_major" -ge 18 ]; then
            return 0
        fi
    fi

    if [ "$IS_MACOS" = true ]; then
        echo -e "${YELLOW}Node.js 18+ not found. Installing Node.js 20 with Homebrew...${NC}"
        ensure_homebrew || return 1
        brew install node@20

        if [ -x "/opt/homebrew/bin/brew" ]; then
            eval "$(/opt/homebrew/bin/brew shellenv)"
        elif [ -x "/usr/local/bin/brew" ]; then
            eval "$(/usr/local/bin/brew shellenv)"
        fi

        if ! command -v node >/dev/null 2>&1; then
            local node_prefix
            node_prefix="$(brew --prefix node@20 2>/dev/null || true)"
            if [ -n "$node_prefix" ]; then
                export PATH="$node_prefix/bin:$PATH"
            fi
        fi
    elif [ "$IS_WINDOWS" = true ]; then
        echo -e "${YELLOW}Node.js 18+ not found. Installing Node.js LTS via winget...${NC}"
        local winget_cmd
        if winget_cmd="$(find_winget)"; then
            "$winget_cmd" install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements || true
            hash -r
        fi
    fi

    if ! command -v node >/dev/null 2>&1; then
        return 1
    fi

    local node_version
    local node_major
    node_version="$(node --version | sed 's/^v//')"
    node_major="$(echo "$node_version" | cut -d. -f1)"
    [ "$node_major" -ge 18 ]
}

# Check Python
echo -e "${BLUE}Checking Python installation...${NC}"
PYTHON_BIN=""
if ! ensure_python; then
    echo -e "${RED}✗ Python 3.10+ not found${NC}"
    echo -e "${YELLOW}Please install Python 3.10+ from https://python.org${NC}"
    if [ "$IS_LINUX" = true ]; then
        echo -e "${YELLOW}Ubuntu/Debian example: sudo apt install python3.11 python3.11-venv python3-pip${NC}"
    elif [ "$IS_WINDOWS" = true ]; then
        echo -e "${YELLOW}Windows example: winget install -e --id Python.Python.3.11${NC}"
    fi
    exit 1
fi

PYTHON_VERSION=$($PYTHON_BIN --version | awk '{print $2}')
PYTHON_MAJOR=$(echo "$PYTHON_VERSION" | cut -d. -f1)
PYTHON_MINOR=$(echo "$PYTHON_VERSION" | cut -d. -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 10 ]); then
    echo -e "${RED}✗ Python $PYTHON_VERSION found, but 3.10+ required${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python $PYTHON_VERSION (${PYTHON_BIN})${NC}"

# Check Node.js (if needed)
if [ "$INSTALL_NODE" = true ]; then
    echo -e "${BLUE}Checking Node.js installation...${NC}"
    if ! ensure_node; then
        echo -e "${RED}✗ Node.js 18+ not found${NC}"
        echo -e "${YELLOW}Please install Node.js 18+ from https://nodejs.org${NC}"
        if [ "$IS_LINUX" = true ]; then
            echo -e "${YELLOW}Linux example: install Node.js 20 from NodeSource${NC}"
        elif [ "$IS_WINDOWS" = true ]; then
            echo -e "${YELLOW}Windows example: winget install -e --id OpenJS.NodeJS.LTS${NC}"
        fi
        exit 1
    fi
    
    NODE_VERSION=$(node --version | sed 's/^v//')
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
    
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
        "$PYTHON_BIN" -m venv venv
        echo -e "${GREEN}✓ Virtual environment created${NC}"
    else
        echo -e "${YELLOW}Virtual environment already exists${NC}"
    fi

    # Use venv python directly to keep behavior consistent across shells/OS.
    VENV_PYTHON="venv/bin/python"
    if [ "$IS_WINDOWS" = true ]; then
        VENV_PYTHON="venv/Scripts/python.exe"
    fi

    if [ ! -x "$VENV_PYTHON" ]; then
        echo -e "${RED}✗ Virtual environment python not found at $VENV_PYTHON${NC}"
        exit 1
    fi
    
    # Upgrade pip
    echo -e "${BLUE}Upgrading pip...${NC}"
    "$VENV_PYTHON" -m pip install --upgrade pip setuptools wheel
    
    # Install base requirements
    echo -e "${BLUE}Installing base requirements...${NC}"
    "$VENV_PYTHON" -m pip install -r requirements.txt
    echo -e "${GREEN}✓ Base Python dependencies installed${NC}"
    
    # Install Module 6 if requested
    if [ "$INSTALL_MODULE_6" = true ]; then
        echo ""
        echo -e "${YELLOW}${BOLD}Installing Module 6 (LLM Training) dependencies...${NC}"
        echo -e "${YELLOW}This may take 10-20 minutes and download 5-10GB${NC}"
        echo -e "${YELLOW}Press Ctrl+C to skip or wait 5 seconds to continue...${NC}"
        sleep 5
        
        if [ -f "module-6-llm-training/requirements.txt" ]; then
            "$VENV_PYTHON" -m pip install -r module-6-llm-training/requirements.txt
            echo -e "${GREEN}✓ Module 6 dependencies installed${NC}"
        else
            echo -e "${RED}✗ module-6-llm-training/requirements.txt not found${NC}"
        fi
    fi
    
    echo ""
    echo -e "${GREEN}${BOLD}Python setup complete!${NC}"
    echo -e "${CYAN}To activate the virtual environment later, run:${NC}"
    if [ "$IS_WINDOWS" = true ]; then
        echo -e "${BOLD}  PowerShell: ./venv/Scripts/Activate.ps1${NC}"
        echo -e "${BOLD}  CMD:        venv/Scripts/activate.bat${NC}"
    else
        echo -e "${BOLD}  source venv/bin/activate${NC}"
    fi
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
    if [ "$IS_WINDOWS" = true ]; then
        echo -e "   ${BOLD}PowerShell: ./venv/Scripts/Activate.ps1${NC}"
        echo -e "   ${BOLD}CMD:        venv/Scripts/activate.bat${NC}"
    else
        echo -e "   ${BOLD}source venv/bin/activate${NC}"
    fi
    echo ""
    echo -e "${CYAN}2. Generate synthetic data (Module 5):${NC}"
    if [ "$IS_WINDOWS" = true ]; then
        echo -e "   ${BOLD}venv/Scripts/python.exe module-5-synthetic-data/generators/generate_patient_data.py${NC}"
    else
        echo -e "   ${BOLD}python module-5-synthetic-data/generators/generate_patient_data.py${NC}"
    fi
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
