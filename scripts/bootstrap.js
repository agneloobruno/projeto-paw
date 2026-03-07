const { exec } = require('child_process');
const path = require('path');
const waitForDb = require('./wait-db');

function runCmd(cmd, opts = {}) {
  const cwd = opts.cwd || path.join(__dirname, '..');
  return new Promise((resolve, reject) => {
    const p = exec(cmd, { cwd, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject({ err, stdout: stdout ? stdout.toString() : '', stderr: stderr ? stderr.toString() : '' });
      return resolve({ stdout: stdout ? stdout.toString() : '', stderr: stderr ? stderr.toString() : '' });
    });
    p.stdout && p.stdout.pipe(process.stdout);
    p.stderr && p.stderr.pipe(process.stderr);
  });
}

async function main() {
  try {
    console.log('Bootstrap: aguardando DB...');
    await waitForDb({ retries: 30, delayMs: 2000 });

    console.log('Bootstrap: executando init-db.js');
    await runCmd('node scripts/init-db.js');

    console.log('Bootstrap: garantindo colunas (imagem, imdb_rating)');
    await runCmd('node scripts/add-poster-column.js');
    await runCmd('node scripts/add-imdb-column.js');

    if (process.env.SEED_ON_BOOT === 'true') {
      console.log('Bootstrap: SEED_ON_BOOT=true — executando seed-classics.js');
      await runCmd('node scripts/seed-classics.js');
    }

    console.log('Bootstrap concluído com sucesso.');
    process.exit(0);
  } catch (e) {
    console.error('Bootstrap falhou:', (e && e.err && e.err.message) || e);
    if (e && e.stdout) console.error('stdout:', e.stdout);
    if (e && e.stderr) console.error('stderr:', e.stderr);
    process.exit(1);
  }
}

main();
