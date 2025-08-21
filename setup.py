#!/usr/bin/env python3
"""
Cross-platform setup script for BRM Renewal Calendar
Works on Windows, macOS, and Linux
"""

import sys
import subprocess
import platform
from pathlib import Path

def run_command(command, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, check=True, 
                              capture_output=True, text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def check_requirements():
    """Check if Python and Node.js are installed"""
    print("🔍 Checking requirements...")
    
    # Check Python
    if sys.version_info < (3, 7):
        print("❌ Python 3.7+ is required")
        return False
    
    # Check Node.js
    success, _ = run_command("node --version")
    if not success:
        print("❌ Node.js is required but not installed")
        return False
    
    print("✅ Requirements satisfied")
    return True

def create_venv():
    """Create Python virtual environment"""
    print("📦 Creating Python virtual environment...")
    
    venv_path = Path("brm_venv")
    if venv_path.exists():
        print("⚠️  Virtual environment already exists")
        return True
    
    success, output = run_command(f"{sys.executable} -m venv brm_venv")
    if success:
        print("✅ Virtual environment created")
        return True
    else:
        print(f"❌ Failed to create virtual environment: {output}")
        return False

def get_activate_command():
    """Get the command to activate virtual environment based on platform"""
    if platform.system() == "Windows":
        return "brm_venv\\Scripts\\activate"
    else:
        return "source brm_venv/bin/activate"

def get_python_command():
    """Get the python command based on platform"""
    if platform.system() == "Windows":
        return str(Path("brm_venv") / "Scripts" / "python.exe")
    else:
        return "brm_venv/bin/python"

def install_python_deps():
    """Install Python dependencies"""
    print("🐍 Installing Python dependencies...")
    
    python_cmd = get_python_command()
        
    cmd = f'"{python_cmd}" -m pip install -r "server/requirements.txt"'
    
    success, output = run_command(cmd)
    
    if success:
        print("✅ Python dependencies installed")
        return True
    else:
        print(f"❌ Failed to install Python dependencies: {output}")
        print(f"Command was: {cmd}")
        print(f"Current directory: {Path.cwd()}")
        return False

def install_node_deps():
    """Install Node.js dependencies"""
    print("⚛️ Installing Node.js dependencies...")
    
    success, output = run_command("npm install", cwd="client")
    
    if success:
        print("✅ Node.js dependencies installed")
        return True
    else:
        print(f"❌ Failed to install Node.js dependencies: {output}")
        return False

def create_env_file():
    """Create .env file if it doesn't exist"""
    env_path = Path("server/.env")
    
    if env_path.exists():
        print("📄 .env file already exists")
        return
    
    print("📄 Creating .env file...")
    
    env_content = """SECRET_KEY=dev-secret-key-change-in-production
OPENROUTER_API_KEY=your-openrouter-key-here
FLASK_ENV=development
"""
    
    try:
        with open(env_path, 'w') as f:
            f.write(env_content)
        print("✅ .env file created")
        print("⚠️  Please update server/.env with your OpenRouter API key")
    except Exception as e:
        print(f"❌ Failed to create .env file: {e}")

def print_next_steps():
    """Print instructions for next steps"""
    activate_cmd = get_activate_command()
    
    print("\n✅ Setup complete!")
    print("\nNext steps:")
    print("1. Add your OpenRouter API key to server/.env")
    
    if platform.system() == "Windows":
        print("2. Run backend:")
        print("   cd server")
        print("   ..\\brm_venv\\Scripts\\activate")
        print("   python run.py")
    else:
        print("2. Run backend:")
        print("   cd server")
        print("   source ../brm_venv/bin/activate")
        print("   python run.py")
    
    print("3. Run frontend (in new terminal):")
    print("   cd client")
    print("   npm start")

def main():
    """Main setup function"""
    print("🚀 Setting up BRM Renewal Calendar...")
    print(f"Platform: {platform.system()}")
    
    if not check_requirements():
        sys.exit(1)
    
    if not create_venv():
        sys.exit(1)
    
    if not install_python_deps():
        sys.exit(1)
    
    if not install_node_deps():
        sys.exit(1)
    
    create_env_file()
    print_next_steps()

if __name__ == "__main__":
    main()