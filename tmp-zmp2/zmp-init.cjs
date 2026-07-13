const { spawn } = require('child_process');
const fs = require('fs');

const p = spawn('npx', ['zmp', 'init', 'zmp-test-app'], { cwd: '/home/hoan/Projects/echo-english/tmp-zmp2' });

p.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  
  if (output.includes('Mini App ID')) {
    p.stdin.write('2338690423754943158\n');
  }
  
  if (output.includes('Choose a Login Method')) {
    p.stdin.write('\n'); // Choose option 1
  }
});
p.stderr.on('data', (data) => process.stderr.write(data.toString()));
p.on('close', (code) => console.log('Exited with code', code));
