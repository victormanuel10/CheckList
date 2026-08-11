import { spawn } from "node:child_process";
import process from "node:process";

const port = process.env.PORT || "80";

const child = spawn(
  process.execPath,
  ["./node_modules/vinext/dist/cli.js", "start", "--hostname", "0.0.0.0", "--port", port],
  {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NODE_ENV: "production" },
  }
);

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
