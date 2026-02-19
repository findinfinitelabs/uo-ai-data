# Windows Setup Guide

Special instructions for Windows users setting up the UO AI Data Class environment.

## 🪟 Two Options for Windows

### Option A: WSL2 (Recommended) ⭐

**Best for**: Full compatibility with all deployment scripts and AWS tools

**Pros:**
- ✅ Linux environment on Windows
- ✅ All shell scripts work natively
- ✅ Better Docker integration
- ✅ Same commands as macOS/Linux

**Cons:**
- ⚠️ Requires Windows 10 version 2004+ or Windows 11
- ⚠️ Additional setup step

### Option B: Native Windows

**Best for**: Python modules only (Modules 1-6 without AWS deployment)

**Pros:**
- ✅ No WSL2 required
- ✅ Works with PowerShell/CMD
- ✅ Simpler for Python-only work

**Cons:**
- ❌ Deployment scripts don't work (bash scripts)
- ❌ Some tools harder to install (eksctl, kubectl)
- ⚠️ Must use Windows-specific commands

---

## 📦 Option A: WSL2 Setup (Recommended)

### Step 1: Install WSL2

**Check if WSL2 is already installed:**

```powershell
wsl --version
```

If you see version info, WSL2 is installed. Skip to Step 2.

**Install WSL2 (one command):**

Open PowerShell as **Administrator** and run:

```powershell
wsl --install
```

This installs:
- WSL2
- Ubuntu (default Linux distribution)
- Virtual Machine Platform

**Restart your computer** when prompted.

### Step 2: Set Up Ubuntu

1. After restart, Ubuntu will open automatically
2. Create a username (lowercase, no spaces): `your_name`
3. Create a password (you won't see it typed)
4. Wait for installation to complete

### Step 3: Update Ubuntu

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 4: Install Python and Dependencies

```bash
# Install Python and build tools
sudo apt install -y python3.11 python3.11-venv python3-pip
sudo apt install -y build-essential libpq-dev unixodbc-dev

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git
```

### Step 5: Clone Repository

```bash
# Clone the repo
cd ~
git clone https://github.com/findinfinitelabs/uo-ai-data.git
cd uo-ai-data
```

### Step 6: Run Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

### Step 7: Access Your Files

**From WSL2**, your Windows files are at: `/mnt/c/Users/YourName/`

**From Windows**, your WSL2 files are at: `\\wsl$\Ubuntu\home\your_name\uo-ai-data`

**Tip**: Use VS Code with the "Remote - WSL" extension to edit files easily!

---

## 💻 Option B: Native Windows Setup

### Step 1: Install Python

1. Download Python 3.11 from [python.org](https://www.python.org/downloads/)
2. **Important**: Check "Add Python to PATH" during installation
3. Click "Install Now"

**Verify installation:**

```powershell
python --version
# Should show Python 3.11.x
```

### Step 2: Install Node.js

1. Download Node.js 20 LTS from [nodejs.org](https://nodejs.org/)
2. Run installer (default options are fine)

**Verify installation:**

```powershell
node --version
# Should show v20.x
```

### Step 3: Install Git

1. Download Git from [git-scm.com](https://git-scm.com/)
2. Run installer (default options recommended)

### Step 4: Clone Repository

Open **PowerShell** and run:

```powershell
# Navigate to your Documents folder
cd $HOME\Documents

# Clone the repository
git clone https://github.com/findinfinitelabs/uo-ai-data.git
cd uo-ai-data
```

### Step 5: Set Up Python Environment

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# If you get an error about execution policy, run this first:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

### Step 6: Set Up React App

```powershell
# Navigate to react-guide
cd react-guide

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🔧 Installing Visual C++ Build Tools (If Needed)

Some Python packages require C++ compilation on Windows.

**If you see error**: "Microsoft Visual C++ 14.0 or greater is required"

### Quick Fix:

1. Download [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
2. Run installer
3. Select "Desktop development with C++"
4. Click Install (this takes ~6GB and 20-30 minutes)

**Alternative** (smaller download):

Install build tools via Chocolatey:

```powershell
# Install Chocolatey (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install build tools
choco install visualstudio2022buildtools -y
```

---

## 🚀 Working with AWS Tools on Windows

### For WSL2 Users: ✅ Full Support

Install AWS tools inside Ubuntu:

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Install Docker
sudo apt install docker.io -y
sudo usermod -aG docker $USER
```

### For Native Windows Users: ⚠️ Limited Support

You can install AWS CLI natively:

1. Download [AWS CLI MSI installer](https://awscli.amazonaws.com/AWSCLIV2.msi)
2. Run installer

**But**: Deployment scripts (`.sh` files) won't work. You'd need to:
- Manually run AWS commands
- Skip cluster deployment features
- Focus on Modules 1-6 (non-deployment work)

---

## 📝 Common Windows Commands

### Virtual Environment

| Task | macOS/Linux | Windows (PowerShell) | Windows (CMD) |
|------|-------------|---------------------|---------------|
| Create | `python3 -m venv venv` | `python -m venv venv` | `python -m venv venv` |
| Activate | `source venv/bin/activate` | `.\venv\Scripts\Activate.ps1` | `venv\Scripts\activate.bat` |
| Deactivate | `deactivate` | `deactivate` | `deactivate` |

### File Paths

| macOS/Linux | Windows |
|-------------|---------|
| `/Users/name/uo-ai-data` | `C:\Users\name\uo-ai-data` |
| `~/Documents` | `$HOME\Documents` |
| `./script.sh` | `.\script.ps1` or `python script.py` |

### Running Python Scripts

```powershell
# Same on all platforms (when venv active)
python module-5-synthetic-data/generators/generate_patient_data.py
```

---

## 🛠️ VS Code Setup for Windows

### Install VS Code

1. Download from [code.visualstudio.com](https://code.visualstudio.com/)
2. Install with default options

### Install Extensions

**For WSL2 users:**
- Remote - WSL (by Microsoft)
- Python (by Microsoft)
- ESLint
- Prettier

**For native Windows:**
- Python (by Microsoft)
- ESLint
- Prettier

### Open Project

**WSL2:**
1. Open VS Code
2. Press `F1`
3. Type "WSL: Open Folder in WSL"
4. Navigate to `uo-ai-data`

**Native Windows:**
1. File → Open Folder
2. Navigate to `C:\Users\YourName\Documents\uo-ai-data`

---

## 🐛 Troubleshooting

### "python is not recognized as an internal or external command"

**Solution**: Add Python to PATH

1. Search for "Environment Variables" in Windows Start
2. Click "Environment Variables"
3. Under "System Variables", find "Path"
4. Click "Edit"
5. Click "New"
6. Add: `C:\Users\YourName\AppData\Local\Programs\Python\Python311`
7. Add: `C:\Users\YourName\AppData\Local\Programs\Python\Python311\Scripts`
8. Click OK on all windows
9. **Restart PowerShell**

### "Execution policy" error when activating venv

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try activating again.

### NumPy/Pandas installation fails

Install Visual C++ Build Tools (see above section).

Or try:

```powershell
pip install --only-binary :all: numpy pandas
```

### Git Bash shows "Permission denied" for .sh files

Use WSL2 instead of Git Bash for shell scripts, or convert to PowerShell.

### WSL2 uses too much RAM

Create file: `C:\Users\YourName\.wslconfig`

```ini
[wsl2]
memory=4GB
processors=2
```

Restart WSL2:

```powershell
wsl --shutdown
```

---

## 📚 Additional Resources

- [WSL2 Documentation](https://docs.microsoft.com/en-us/windows/wsl/)
- [Python on Windows](https://docs.python.org/3/using/windows.html)
- [VS Code Remote - WSL](https://code.visualstudio.com/docs/remote/wsl)
- [Windows Terminal](https://aka.ms/terminal) - Better terminal experience

---

## ✅ Quick Setup Summary

### WSL2 (Full Experience):

```powershell
# In PowerShell (as Admin)
wsl --install

# Restart computer, then in Ubuntu:
sudo apt update && sudo apt install -y python3.11 python3-pip nodejs git
git clone https://github.com/findinfinitelabs/uo-ai-data.git
cd uo-ai-data
./setup.sh
```

### Native Windows (Python/React Only):

```powershell
# In PowerShell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

cd react-guide
npm install
npm run dev
```

**Recommendation**: If you plan to do AWS deployments, use WSL2. For Python learning only, native Windows is fine!
