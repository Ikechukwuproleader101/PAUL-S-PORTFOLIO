const { execSync } = require('child_process');
const fs = require('fs');

fs.writeFileSync('scratch/Desktop-3.png', execSync('git show "8de41f7:Desktop - 3.png"'));
console.log('Saved scratch/Desktop-3.png');
