import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const input = process.argv.slice(2);
const args = [];

// Kimi Work uses Vite-compatible preview flags. Translate --host for Next.js
// and omit --strictPort because Next already fails when the port is occupied.
for (let index = 0; index < input.length; index += 1) {
  const arg = input[index];
  if (arg === "--strictPort") continue;
  if (arg === "--host" || arg === "-H") {
    if (input[index + 1]) args.push("--hostname", input[++index]);
    continue;
  }
  if (arg.startsWith("--host=")) {
    args.push(`--hostname=${arg.slice("--host=".length)}`);
    continue;
  }
  args.push(arg);
}

const child = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), "dev", ...args],
  { stdio: "inherit", env: process.env },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
child.on("exit", (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
