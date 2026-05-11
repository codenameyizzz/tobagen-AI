import net from 'node:net';
import { spawn } from 'node:child_process';

const backendPort = await getAvailablePort(3001);
const frontendPort = await getAvailablePort(3000, new Set([backendPort]));
const apiProxyTarget = `http://localhost:${backendPort}`;

console.log(`[dev] Backend API will run on ${apiProxyTarget}`);
console.log(`[dev] Frontend will run on http://localhost:${frontendPort}`);

const runners = [
  createRunner('dev:server', { PORT: String(backendPort) }),
  createRunner('dev:client', { VITE_DEV_API_PROXY_TARGET: apiProxyTarget }, ['--port', String(frontendPort), '--strictPort']),
];

let shuttingDown = false;

for (const runner of runners) {
  runner.on('exit', (code) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    for (const current of runners) {
      current.kill('SIGTERM');
    }

    process.exit(code ?? 0);
  });
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    for (const runner of runners) {
      currentSafeKill(runner);
    }

    process.exit(0);
  });
}

function createRunner(scriptName, extraEnv = {}, extraArgs = []) {
  const env = {
    ...process.env,
    ...extraEnv,
  };

  if (process.platform === 'win32') {
    const command = ['npm', 'run', scriptName];
    if (extraArgs.length > 0) {
      command.push('--', ...extraArgs);
    }

    return spawn('cmd.exe', ['/d', '/s', '/c', command.join(' ')], {
      cwd: process.cwd(),
      stdio: 'inherit',
      env,
    });
  }

  const args = ['run', scriptName];
  if (extraArgs.length > 0) {
    args.push('--', ...extraArgs);
  }

  return spawn('npm', args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    env,
  });
}

function currentSafeKill(childProcess) {
  if (!childProcess.killed) {
    childProcess.kill('SIGTERM');
  }
}

async function getAvailablePort(startPort, reservedPorts = new Set()) {
  let port = startPort;

  while (reservedPorts.has(port) || !(await isPortAvailable(port))) {
    port += 1;
  }

  return port;
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, '0.0.0.0');
  });
}
