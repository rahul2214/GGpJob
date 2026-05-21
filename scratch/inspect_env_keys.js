const fs = require('fs');

function main() {
  let envFile = '';
  try {
      envFile = fs.readFileSync('.env.local', 'utf8');
      console.log("Found .env.local");
  } catch(e) {
      try {
          envFile = fs.readFileSync('.env', 'utf8');
          console.log("Found .env");
      } catch(err) {
          console.log("No env files found");
          return;
      }
  }

  const lines = envFile.split('\n');
  console.log("Environment keys:");
  for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
          const key = trimmed.split('=')[0];
          console.log("  -", key);
      }
  }
}

main();
