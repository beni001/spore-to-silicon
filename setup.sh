#!/bin/bash
# SporeNet CLI Setup Script
# Installs all dependencies and sets up the development environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ASCII Banner
echo -e "${BLUE}"
cat << "EOF"
🧬 ███████╗██████╗  ██████╗ ██████╗ ███████╗███╗   ██╗███████╗████████╗
   ██╔════╝██╔══██╗██╔═══██╗██╔══██╗██╔════╝████╗  ██║██╔════╝╚══██╔══╝
   ███████╗██████╔╝██║   ██║██████╔╝█████╗  ██╔██╗ ██║█████╗     ██║   
   ╚════██║██╔═══╝ ██║   ██║██╔══██╗██╔══╝  ██║╚██╗██║██╔══╝     ██║   
   ███████║██║     ╚██████╔╝██║  ██║███████╗██║ ╚████║███████╗   ██║   
   ╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚══════╝   ╚═╝   

   🔬 Setup Script v0.1.0
EOF
echo -e "${NC}"

echo -e "${GREEN}🚀 Setting up SporeNet CLI environment...${NC}\n"

# Check OS
OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
fi

echo -e "${BLUE}🖥️  Detected OS: $OS${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${YELLOW}🔍 Checking prerequisites...${NC}"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
    
    # Check if version is >= 18
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo -e "${RED}❌ Node.js version 18+ required. Please upgrade.${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Node.js not found${NC}"
    echo -e "${YELLOW}📥 Install Node.js from: https://nodejs.org/${NC}"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm: v$NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Check Python
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ Python: $PYTHON_VERSION${NC}"
else
    echo -e "${RED}❌ Python 3 not found${NC}"
    echo -e "${YELLOW}📥 Install Python from: https://python.org/${NC}"
    exit 1
fi

# Check pip
if command_exists pip3; then
    PIP_VERSION=$(pip3 --version)
    echo -e "${GREEN}✅ pip: $PIP_VERSION${NC}"
else
    echo -e "${RED}❌ pip3 not found${NC}"
    exit 1
fi

# Install Node.js dependencies
echo -e "\n${YELLOW}📦 Installing Node.js dependencies...${NC}"
npm install

# Install Python dependencies
echo -e "\n${YELLOW}🐍 Installing Python dependencies...${NC}"
pip3 install -r requirements.txt

# Check ESP-IDF (optional but recommended)
echo -e "\n${YELLOW}🔧 Checking ESP-IDF...${NC}"
if [ -n "${IDF_PATH}" ] && [ -d "${IDF_PATH}" ]; then
    echo -e "${GREEN}✅ ESP-IDF found at: $IDF_PATH${NC}"
    
    # Check ESP-IDF version
    if command_exists idf.py; then
        IDF_VERSION=$(idf.py --version 2>/dev/null | head -n1 || echo "unknown")
        echo -e "${GREEN}   Version: $IDF_VERSION${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  ESP-IDF not found (optional for development)${NC}"
    echo -e "${BLUE}   To install ESP-IDF:${NC}"
    echo -e "${BLUE}   1. Visit: https://docs.espressif.com/projects/esp-idf/en/latest/esp32/get-started/${NC}"
    echo -e "${BLUE}   2. Follow the installation guide for your OS${NC}"
    echo -e "${BLUE}   3. Run: . \$HOME/esp/esp-idf/export.sh${NC}"
fi

# Check esptool
if command_exists esptool.py; then
    ESPTOOL_VERSION=$(esptool.py version 2>/dev/null | head -n1 || echo "unknown")
    echo -e "${GREEN}✅ esptool: $ESPTOOL_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  esptool not found${NC}"
    echo -e "${BLUE}   Installing esptool...${NC}"
    pip3 install esptool
fi

# Make CLI executable
echo -e "\n${YELLOW}🔧 Setting up CLI...${NC}"
chmod +x index.js

# Test CLI
echo -e "\n${YELLOW}🧪 Testing CLI...${NC}"
if ./index.js --version; then
    echo -e "${GREEN}✅ CLI working correctly${NC}"
else
    echo -e "${RED}❌ CLI test failed${NC}"
    exit 1
fi

# Create symbolic link for global access (optional)
echo -e "\n${YELLOW}🔗 Setting up global access...${NC}"
if command_exists npm; then
    npm link 2>/dev/null || echo -e "${YELLOW}⚠️  Global link failed (may need sudo)${NC}"
fi

# Final success message
echo -e "\n${GREEN}🎉 SporeNet CLI setup complete!${NC}\n"

echo -e "${BLUE}🚀 Quick start:${NC}"
echo -e "   1. Place your model in the current directory"
echo -e "   2. Run: ${YELLOW}./index.js build${NC}"
echo -e "   3. Flash: ${YELLOW}./index.js flash -p /dev/ttyUSB0${NC}"
echo -e ""
echo -e "${BLUE}📚 Examples:${NC}"
echo -e "   ${YELLOW}./index.js init my-project${NC}     # Create new project"
echo -e "   ${YELLOW}./index.js build --help${NC}       # See build options"
echo -e "   ${YELLOW}./index.js monitor${NC}            # Monitor ESP32 output"
echo -e ""
echo -e "${BLUE}🔗 Resources:${NC}"
echo -e "   GitHub: https://github.com/beni001/spore-to-silicon"
echo -e "   Docs: Check README.md for detailed usage"

# Check for common issues
echo -e "\n${YELLOW}🔍 System check complete${NC}"

if [ "$OS" == "linux" ]; then
    echo -e "${BLUE}💡 Linux users: Add your user to dialout group for serial access:${NC}"
    echo -e "   ${YELLOW}sudo usermod -a -G dialout \$USER${NC}"
    echo -e "   ${YELLOW}# Then logout and login again${NC}"
fi

if [ "$OS" == "macos" ]; then
    echo -e "${BLUE}💡 macOS users: Install CP210x drivers if using ESP32 DevKit:${NC}"
    echo -e "   https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers"
fi

echo -e "\n${GREEN}✨ Happy hacking with SporeNet! ✨${NC}"