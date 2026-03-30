# Quick Reference - Platform-Specific Commands

Cross-platform command reference for macOS, Linux, and Windows users.

## 📦 Setup Commands

### Clone Repository

**All Platforms:**
```bash
git clone https://github.com/findinfinitelabs/uo-ai-data.git
cd uo-ai-data
```

### Automated Setup

| Platform | Command |
|----------|---------|
| **macOS** | `./setup.sh` |
| **Linux** | `./setup.sh` |
| **Windows (WSL2)** | `./setup.sh` |
| **Windows (PowerShell)** | See manual installation below |

---

## 🐍 Python Virtual Environment

### Create Virtual Environment

| Platform | Command |
|----------|---------|
| **macOS/Linux** | `python3 -m venv venv` |
| **Windows (all)** | `python -m venv venv` |

### Activate Virtual Environment

| Platform | Command |
|----------|---------|
| **macOS/Linux** | `source venv/bin/activate` |
| **Windows (PowerShell)** | `.\venv\Scripts\Activate.ps1` |
| **Windows (CMD)** | `venv\Scripts\activate.bat` |
| **Windows (Git Bash)** | `source venv/Scripts/activate` |

### Deactivate Virtual Environment

**All Platforms:**
```bash
deactivate
```

### Install Python Packages

**All Platforms (when venv is active):**
```bash
pip install -r requirements.txt
```

---

## 📁 File Paths

### Home Directory

| Platform | Path | Variable |
|----------|------|----------|
| **macOS** | `/Users/username` | `~` or `$HOME` |
| **Linux** | `/home/username` | `~` or `$HOME` |
| **Windows (PowerShell)** | `C:\Users\username` | `$HOME` |
| **Windows (CMD)** | `C:\Users\username` | `%USERPROFILE%` |
| **Windows (WSL2)** | `/home/username` | `~` or `$HOME` |

### Current Directory

| Platform | Symbol |
|----------|--------|
| **macOS/Linux/WSL2** | `.` |
| **Windows** | `.` |

### Parent Directory

| Platform | Symbol |
|----------|--------|
| **macOS/Linux/WSL2** | `..` |
| **Windows** | `..` |

### Path Separator

| Platform | Separator | Example |
|----------|-----------|---------|
| **macOS/Linux/WSL2** | `/` | `module-5-synthetic-data/generators` |
| **Windows (PowerShell)** | `\` or `/` | `module-5-synthetic-data\generators` |

---

## 🎯 Running Python Scripts

### Module 5: Generate Synthetic Data

**All Platforms:**
```bash
python module-5-synthetic-data/generators/generate_patient_data.py
python module-5-synthetic-data/generators/generate_dental_data.py
```

---

## 🌐 Node.js / React App

### Install Dependencies

**All Platforms:**
```bash
cd react-guide
npm install
```

### Start Development Server

**All Platforms:**
```bash
npm run dev
```

### Access the App

**All Platforms:**  
Open browser to [http://localhost:5173](http://localhost:5173)

---

## 🛠️ Common Tools

### Check Versions

| Tool | Command (All Platforms) |
|------|-------------------------|
| Python | `python --version` or `python3 --version` |
| pip | `pip --version` or `pip3 --version` |
| Node.js | `node --version` |
| npm | `npm --version` |
| Git | `git --version` |

### View File Contents

| Platform | Command |
|----------|---------|
| **macOS/Linux/WSL2** | `cat filename.txt` |
| **Windows (PowerShell)** | `Get-Content filename.txt` or `cat filename.txt` |
| **Windows (CMD)** | `type filename.txt` |

### List Files

| Platform | Command |
|----------|---------|
| **macOS/Linux/WSL2** | `ls` or `ls -la` |
| **Windows (PowerShell)** | `dir` or `ls` |
| **Windows (CMD)** | `dir` |

### Clear Screen

| Platform | Command |
|----------|---------|
| **macOS/Linux/WSL2** | `clear` |
| **Windows (PowerShell)** | `Clear-Host` or `cls` |
| **Windows (CMD)** | `cls` |

---

## 🔐 Environment Variables

### Set Environment Variable (Current Session)

| Platform | Command |
|----------|---------|
| **macOS/Linux/WSL2** | `export VAR_NAME=value` |
| **Windows (PowerShell)** | `$env:VAR_NAME = "value"` |
| **Windows (CMD)** | `set VAR_NAME=value` |

### Set Permanently

| Platform | File to Edit |
|----------|--------------|
| **macOS (zsh)** | `~/.zshrc` |
| **macOS (bash)** | `~/.bash_profile` or `~/.bashrc` |
| **Linux** | `~/.bashrc` or `~/.profile` |
| **Windows (PowerShell)** | Add to `$PROFILE` (create if doesn't exist) |
| **Windows (System)** | System Properties → Environment Variables |

---

## 🐳 Docker Commands

### Start Docker

| Platform | How to Start |
|----------|--------------|
| **macOS** | Open Docker Desktop |
| **Linux** | `sudo systemctl start docker` |
| **Windows** | Open Docker Desktop |
| **WSL2** | Docker Desktop with WSL2 integration |

### Check Docker Status

**All Platforms:**
```bash
docker ps
```

---

## ☁️ AWS CLI Commands

### Configure AWS Credentials

**All Platforms:**
```bash
aws configure
```

### Configure SSO

**All Platforms:**
```bash
aws configure sso
aws sso login --profile YOUR_PROFILE
```

### Set AWS Profile

| Platform | Command |
|----------|---------|
| **macOS/Linux/WSL2** | `export AWS_PROFILE=profile_name` |
| **Windows (PowerShell)** | `$env:AWS_PROFILE = "profile_name"` |
| **Windows (CMD)** | `set AWS_PROFILE=profile_name` |

---

## 📝 Text Editors

### Open File in Default Editor

| Platform | Command |
|----------|---------|
| **macOS** | `open filename.txt` |
| **Linux** | `xdg-open filename.txt` |
| **Windows** | `start filename.txt` |

### VS Code

**All Platforms:**
```bash
code .                    # Open current directory
code filename.txt         # Open specific file
```

---

## 🔧 Troubleshooting Commands

### Find Python Location

| Platform | Command |
|----------|---------|
| **macOS/Linux/WSL2** | `which python3` |
| **Windows (PowerShell)** | `Get-Command python` |
| **Windows (CMD)** | `where python` |

### Check If Virtual Environment Active

**Look for `(venv)` prefix in your terminal prompt**

Or check Python location:

| Platform | Command |
|----------|---------|
| **macOS/Linux/WSL2** | `which python` (should show `venv/bin/python`) |
| **Windows** | `Get-Command python` (should show `venv\Scripts\python`) |

### Kill Process on Port

| Platform | Command |
|----------|---------|
| **macOS/Linux** | `lsof -ti:5173 \| xargs kill -9` |
| **Windows (PowerShell)** | `Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess \| Stop-Process` |

---

## 📚 Module-Specific Commands

### Module 1-3: Read Documentation

**All Platforms:**
```bash
cd module-1-specifications
cat README.md              # macOS/Linux/WSL2
Get-Content README.md      # PowerShell
```

### Module 5: Run Data Generators

**All Platforms:**
```bash
# Must have venv activated first
python module-5-synthetic-data/generators/generate_patient_data.py
```

### Module 6: LLM Training

**All Platforms:**
```bash
cd module-6-llm-training

# Install dependencies (only needed once)
pip install -r requirements.txt

# Download model
python scripts/download_model.py

# Run training
python scripts/train.py
```

---

## 🎓 Quick Start Cheat Sheet

### First-Time Setup

**macOS/Linux/WSL2:**
```bash
git clone https://github.com/findinfinitelabs/uo-ai-data.git
cd uo-ai-data
./setup.sh
source venv/bin/activate
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/findinfinitelabs/uo-ai-data.git
cd uo-ai-data
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Daily Workflow

**macOS/Linux/WSL2:**
```bash
cd uo-ai-data
source venv/bin/activate
# Do your work...
deactivate
```

**Windows (PowerShell):**
```powershell
cd uo-ai-data
.\venv\Scripts\Activate.ps1
# Do your work...
deactivate
```

---

## 📖 Resources

- **Detailed Setup**: [SYSTEM-REQUIREMENTS.md](SYSTEM-REQUIREMENTS.md)
- **Windows Guide**: [WINDOWS-SETUP.md](WINDOWS-SETUP.md)
- **Deployment Guide**: [deployment-scripts/README.md](deployment-scripts/README.md)

---

**Last Updated**: February 18, 2026  
**Supported Platforms**: macOS, Linux, Windows (native + WSL2)
