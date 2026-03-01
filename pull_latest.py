import subprocess
import os

# Change to project directory
os.chdir('/vercel/share/v0-project')

try:
    # Fetch latest
    result = subprocess.run(['git', 'fetch', 'origin', 'event-management-system'], 
                          capture_output=True, text=True, timeout=30)
    print("Fetch output:", result.stdout)
    if result.stderr:
        print("Fetch stderr:", result.stderr)
    
    # Pull latest
    result = subprocess.run(['git', 'pull', 'origin', 'event-management-system'], 
                          capture_output=True, text=True, timeout=30)
    print("Pull output:", result.stdout)
    if result.stderr:
        print("Pull stderr:", result.stderr)
    
    print("\nLatest changes pulled successfully!")
    
    # Show recent commits
    result = subprocess.run(['git', 'log', '--oneline', '-5'], 
                          capture_output=True, text=True)
    print("\nRecent commits:")
    print(result.stdout)
    
except Exception as e:
    print(f"Error: {e}")
