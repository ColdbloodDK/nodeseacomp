import { spawn } from 'child_process';

async function PromisifiedSpawn(command, args = []) {
  return new Promise<string>((resolve, reject) => {
    const process = spawn(command, args, { shell: true });

    let stdout = '';
    let stderr = '';

    // Handle standard output
    process.stdout.on('data', (data) => {
      stdout += data.toString(); // Accumulate output

    });

    // Handle standard error
    process.stderr.on('data', (data) => {
      stderr += data.toString(); // Accumulate errors
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(stdout); // Resolve with accumulated stdout
      } else {
        reject(new Error(`Process exited with code ${code}: ${stderr}`)); // Reject with error
      }
    });

    // Handle any unexpected errors
    process.on('error', (error) => {
      reject(error);
    });
  });
}

export {
  PromisifiedSpawn
};
