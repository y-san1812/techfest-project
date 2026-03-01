import { execSync } from 'child_process';
import path from 'path';

const projectPath = '/vercel/share/v0-project';

console.log('Pulling latest changes from GitHub...');

try {
  process.chdir(projectPath);
  
  // Fetch all changes
  console.log('Fetching from remote...');
  execSync('git fetch origin event-management-system', { stdio: 'inherit' });
  
  // Reset to latest
  console.log('Resetting to latest...');
  execSync('git reset --hard origin/event-management-system', { stdio: 'inherit' });
  
  console.log('Successfully pulled latest changes!');
  console.log('Current status:');
  execSync('git log --oneline -5', { stdio: 'inherit' });
  
} catch (error) {
  console.error('Error pulling from GitHub:', error.message);
  process.exit(1);
}
