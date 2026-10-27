const fs = require('fs');
const path = require('path');

function walk(dir, results = []) {
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
            walk(fullPath, results);
          }
        } else if (/\.(png|jpg|jpeg|webp)$/i.test(file)) {
          results.push({ path: fullPath, size: stat.size, time: stat.mtimeMs, mtime: stat.mtime });
        }
      } catch (e) {}
    }
  } catch (e) {}
  return results;
}

const base = 'C:\\Users\\Ikechukwu\\.gemini\\antigravity-ide';
const images = walk(base).sort((a, b) => b.time - a.time);
console.log('Top 10 recent images in .gemini:');
images.slice(0, 10).forEach(img => {
  console.log(`${new Date(img.time).toISOString()} | ${img.size} bytes | ${img.path}`);
});
