# System Requirements

Complete system and software requirements for the UO AI Data Class platform.

## 📋 Quick Start Checklist

- [ ] Python 3.10+ installed
- [ ] Node.js 18+ installed
- [ ] 16GB+ RAM (8GB minimum)
- [ ] 20GB+ free disk space
- [ ] macOS, Linux, or Windows with WSL2
- [ ] (Optional) NVIDIA GPU with 8GB+ VRAM for Module 6

---

## 💻 Hardware Requirements

### Minimum Requirements

| Component | Minimum | Recommended | For LLM Training |
|-----------|---------|-------------|------------------|
| **CPU** | Dual-core Intel/AMD | Quad-core or Apple Silicon | 8+ cores |
| **RAM** | 8GB | 16GB | 32GB+ |
| **Storage** | 20GB free | 50GB free | 100GB+ free |
| **GPU** | None (CPU works) | None | NVIDIA 8GB+ VRAM |
| **Internet** | Required for setup | Required | Required for downloads |

### GPU Requirements (Module 6 Only)

**For LLM fine-tuning:**
- **Recommended**: NVIDIA RTX 3080/4080 (10-16GB VRAM)
- **Minimum**: NVIDIA GTX 1660/RTX 3060 (6-8GB VRAM) with QLoRA
- **Budget**: CPU-only works but is 10-20x slower
- **Apple Silicon**: M1/M2/M3 with 16GB+ unified memory (experimental support)

**Cloud alternatives:**
- Google Colab (free tier: limited GPU hours)
- AWS SageMaker (pay-per-use)
- Lambda Labs, RunPod, Vast.ai (GPU rentals)

---

## 🖥️ Operating System

### Supported Platforms

| OS | Version | Notes |
|----|---------|-------|
| **macOS** | 12 (Monterey) or later | ✅ Fully supported, Apple Silicon recommended |
| **Linux** | Ubuntu 20.04+, Fedora 35+, Debian 11+ | ✅ Best for GPU training |
| **Windows** | Windows 10/11 with WSL2 | ⚠️ Use WSL2 for deployment scripts |

### Windows Users

**Two options available:**

**Option A: WSL2 (Recommended for full experience)**
- Required for deployment scripts
- Linux environment on Windows
- Full AWS tools support

```powershell
# Install WSL2
wsl --install

# Or update existing WSL
wsl --update
```

**Option B: Native Windows (Python/React only)**
- Good for Modules 1-6 without AWS deployment
- Use PowerShell or CMD
- No deployment script support

📖 **Detailed Windows Guide**: See [WINDOWS-SETUP.md](WINDOWS-SETUP.md)

---

## 🐍 Python Requirements

### Version

- **Required**: Python 3.10 or later
- **Recommended**: Python 3.11
- **Not supported**: Python 3.9 or earlier

### Installation

**macOS:**
```bash
brew install python@3.11
```

**Linux:**
```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip
```

**Windows:**
Download from [python.org](https://www.python.org/downloads/) or use Microsoft Store

### Verify Installation

```bash
python3 --version  # Should show 3.10.x or 3.11.x
pip3 --version
```

### Module-Specific Python Dependencies

**Module 5 (Synthetic Data):**
- ✅ Standard library only (no pip install needed)

**Module 6 (LLM Training):**
- See [`module-6-llm-training/requirements.txt`](module-6-llm-training/requirements.txt)
- Install: `pip install -r module-6-llm-training/requirements.txt`

**Deployment Scripts:**
```bash
pip3 install boto3 pyyaml neo4j
```

---

## 📦 Node.js Requirements (React App)

### Version

- **Required**: Node.js 18 or later
- **Recommended**: Node.js 20 LTS
- **Not supported**: Node.js 16 or earlier

### Installation

**macOS:**
```bash
brew install node@20
```

**Linux:**
```bash
# Using NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows:**
Download from [nodejs.org](https://nodejs.org/)

### Verify Installation

```bash
node --version   # Should show v18.x or v20.x
npm --version
```

### React App Dependencies

```bash
cd react-guide
npm install
npm run dev  # Start development server
```

---

## ☁️ AWS Requirements (Module 4 & Deployment)

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **AWS CLI** | 2.0+ | AWS authentication and management |
| **kubectl** | 1.27+ | Kubernetes cluster management |
| **eksctl** | 0.150+ | EKS cluster creation |
| **Docker** | 20.10+ | Container operations |
| **Helm** | 3.12+ | Kubernetes package management |

### Installation (macOS)

```bash
brew install awscli kubectl eksctl docker helm
```

### Installation (Linux)

```bash
# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### AWS Account Requirements

- **Account Type**: AWS Innovation Studio/Sandbox account OR personal AWS account
- **IAM Permissions**: PowerUserAccess + IAMFullAccess (or custom policy in `deployment-scripts/iam-policy-healthcare-ai.json`)
- **Credits/Budget**: $200+ for full deployment (~$30/day while running)
- **Region**: us-east-1 or us-west-2 (Bedrock availability)

### Authentication Setup

See detailed guide: [`deployment-scripts/AWS-SETUP.md`](deployment-scripts/AWS-SETUP.md)

```bash
# For federated/SSO accounts
aws configure sso
aws sso login --profile YOUR_PROFILE
export AWS_PROFILE=YOUR_PROFILE

# For IAM users
aws configure
```

---

## 🛠️ Development Tools (Optional but Recommended)

### Code Editors

- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)
  - Extensions: Python, ESLint, Prettier, YAML
- **PyCharm** - Good for Python-heavy work
- **Cursor** - AI-enhanced VS Code fork

### Git

**Required for cloning the repository:**

```bash
# macOS
brew install git

# Linux
sudo apt install git

# Windows
# Download from git-scm.com or use GitHub Desktop
```

### Terminal Enhancements (Optional)

- **macOS/Linux**: iTerm2, Warp, or Alacritty
- **Windows**: Windows Terminal (built-in on Win11)
- **Shell**: zsh with oh-my-zsh or fish shell

---

## 📊 Module-by-Module Requirements

### Module 1: Data Specifications

- ✅ Any text editor
- ✅ JSON viewer (optional)

### Module 2: Regulations

- ✅ Any text editor
- ✅ PDF reader for compliance documents

### Module 3: Ethical AI

- ✅ Any text editor
- ✅ Web browser for interactive content

### Module 4: AI Setup

**Choose one:**

**Option A: AWS Bedrock**
- AWS account with Bedrock access
- AWS CLI configured
- Internet connection

**Option B: Local Ollama**
- macOS or Linux
- 8GB+ RAM (16GB+ recommended)
- 10GB+ free disk space
- [Ollama installed](https://ollama.ai/)

### Module 5: Synthetic Data

- Python 3.10+
- ✅ Standard library only (no extra installs)
- Text editor or IDE

### Module 6: LLM Fine-Tuning

**Minimum:**
- Python 3.10+
- 16GB RAM
- 20GB free disk space
- CPU-only (slow but works)

**Recommended:**
- Python 3.11
- NVIDIA GPU (8GB+ VRAM)
- 32GB RAM
- 50GB free disk space
- CUDA Toolkit 11.8+

**Installation:**
```bash
cd module-6-llm-training
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### React Guide (Interactive Web App)

- Node.js 18+
- npm (comes with Node.js)
- Web browser (Chrome, Firefox, Safari, Edge)

**Installation:**
```bash
cd react-guide
npm install
npm run dev
```

### Deployment Scripts

- All AWS tools (see AWS Requirements above)
- Python 3.10+
- Bash shell (Linux/macOS/WSL2)
- 60-90 minutes for full deployment
- Active internet connection

---

## 🔍 Verification Commands

Run these to verify your system is ready:

```bash
# Python
python3 --version          # Should be 3.10+
pip3 --version

# Node.js
node --version             # Should be v18+
npm --version

# AWS Tools
aws --version              # Should be 2.x
kubectl version --client   # Should be 1.27+
eksctl version            # Should be 0.150+
docker --version          # Should be 20.10+
helm version              # Should be 3.12+

# Git
git --version

# GPU (optional - for Module 6)
nvidia-smi                # Shows GPU info if NVIDIA GPU present
```

### Python Package Verification

```bash
# Create test script
python3 << EOF
import sys
print(f"Python {sys.version}")
import json, csv, random, datetime
print("✓ Standard library imports successful")
EOF
```

---

## 💾 Disk Space Requirements

| Component | Space Required | Notes |
|-----------|---------------|-------|
| Base repository | 100MB | Code and documentation |
| Node.js dependencies | 500MB | `react-guide/node_modules/` |
| Python venv (Module 6) | 5-10GB | With PyTorch, transformers |
| LLM models (Module 6) | 5-20GB | StableLM: ~3GB, Mistral: ~4GB |
| AWS deployment cache | 2-5GB | Docker images, kubectl cache |
| Generated datasets | 10-50MB | Synthetic data outputs |
| **Total (all modules)** | **15-40GB** | Depends on which modules you use |

---

## 🌐 Network Requirements

- **Download bandwidth**: 10+ Mbps recommended
- **Ports**: 
  - 5173 (Vite dev server)
  - 7474, 7687 (Neo4j, if deployed)
  - Various AWS/EKS ports (ephemeral)
- **Firewall**: Allow outbound HTTPS (443) for:
  - GitHub (code repository)
  - npm registry (Node packages)
  - PyPI (Python packages)
  - Hugging Face (model downloads)
  - AWS services

---

## 🚨 Common Issues

### "Command not found"

Add tools to your PATH:

```bash
# Add to ~/.zshrc or ~/.bashrc
export PATH="/usr/local/bin:$PATH"
export PATH="/opt/homebrew/bin:$PATH"  # macOS Apple Silicon
```

### Python version conflicts

Use `python3` explicitly, not `python`:

```bash
python3 --version
pip3 install package_name
```

### GPU not detected (Module 6)

```bash
# Install CUDA Toolkit (Linux)
# See: https://developer.nvidia.com/cuda-downloads

# Verify
python3 -c "import torch; print(torch.cuda.is_available())"
```

### AWS CLI authentication fails

```bash
# For SSO accounts, re-login
aws sso login --profile YOUR_PROFILE

# For IAM users, reconfigure
aws configure
```

### Docker daemon not running

- macOS/Windows: Start Docker Desktop application
- Linux: `sudo systemctl start docker`

---

## 📚 Additional Resources

- **Python**: [python.org/downloads](https://www.python.org/downloads/)
- **Node.js**: [nodejs.org](https://nodejs.org/)
- **AWS CLI**: [docs.aws.amazon.com/cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **kubectl**: [kubernetes.io/docs/tasks/tools](https://kubernetes.io/docs/tasks/tools/)
- **Docker**: [docs.docker.com/get-docker](https://docs.docker.com/get-docker/)
- **CUDA Toolkit**: [developer.nvidia.com/cuda-downloads](https://developer.nvidia.com/cuda-downloads)

---

## 🆘 Getting Help

If you encounter issues:

1. Check the module-specific README files
2. Review deployment logs in `deployment-scripts/`
3. Verify all requirements with the verification commands above
4. Check `.github/workflows/ci.yml` for CI/CD setup examples
5. Consult the `.claude/skills/` documentation for domain-specific guidance

**Last Updated**: February 18, 2026  
**Compatible With**: UO AI Data Class v0.1.0
