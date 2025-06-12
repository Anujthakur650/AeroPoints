import subprocess
import sys
import pkg_resources

def check_package(package_name):
    """Check if a package is installed."""
    try:
        pkg_resources.get_distribution(package_name)
        return True
    except pkg_resources.DistributionNotFound:
        return False

def install_package(package_name):
    """Install a package using pip."""
    print(f"Installing {package_name}...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", package_name])
    print(f"Successfully installed {package_name}.")

def main():
    """Check and install necessary packages."""
    print("Checking and installing required packages for proxy testers...")
    
    # List of required packages
    required_packages = [
        "selenium",
        "webdriver-manager",
        "undetected-chromedriver"
    ]
    
    # Check and install missing packages
    for package in required_packages:
        if not check_package(package):
            print(f"{package} is not installed.")
            install_package(package)
        else:
            print(f"{package} is already installed.")
    
    print("\nAll required packages are installed.")
    print("You can now use the proxy testers:")
    print("- For standard testing: python test_proxy_standard.py IP:PORT:USERNAME:PASSWORD")
    print("- For authenticated proxy testing: python test_proxy_auth.py IP:PORT:USERNAME:PASSWORD")
    print("- For batch testing all proxies: python proxy_tester.py")

if __name__ == "__main__":
    main() 