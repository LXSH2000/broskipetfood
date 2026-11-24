const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const tempIndex = path.join(process.cwd(), '.git', 'temp_index');
if (fs.existsSync(tempIndex)) fs.unlinkSync(tempIndex);

process.env.GIT_INDEX_FILE = tempIndex;
try {
  console.log('Adding dist to temporary index...');
  execSync('git --work-tree=dist add --all', { stdio: 'inherit' });
  const tree = execSync('git write-tree').toString().trim();
  console.log('Tree:', tree);

  if (fs.existsSync(tempIndex)) fs.unlinkSync(tempIndex);

  execSync('git fetch origin gh-pages', { stdio: 'inherit' });
  const parent = execSync('git rev-parse origin/gh-pages').toString().trim();
  console.log('Parent:', parent);

  const commit = execSync(`git commit-tree ${tree} -p ${parent} -m "release(billing): partial payments, repeat doc, watermarks, signature, and backup (24 Nov 2026)"`).toString().trim();
  console.log('Created commit:', commit);

  execSync(`git push origin ${commit}:refs/heads/gh-pages`, { stdio: 'inherit' });
  console.log('Successfully pushed to gh-pages!');
} catch (e) {
  console.error('Deployment error:', e);
  process.exit(1);
}
