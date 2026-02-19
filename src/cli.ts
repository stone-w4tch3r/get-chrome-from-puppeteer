#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { getChrome } from "./index.js";

const HELP = `Usage: get-chrome-from-puppeteer [version] [options]

Arguments:
  version              Chrome version (default: "stable")
                       Examples: stable, canary, beta, 130, 130.0.6723.58

Options:
  --json               Output as JSON { executablePath, buildId }
  --update             Re-install if newer build available
  --cache-dir <path>   Custom cache directory
  --help, -h           Show help
  --version, -v        Show package version

Environment:
  GET_CHROME_PATH      Skip install, use this path directly`;

function getPackageVersion(): string {
  const pkgPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "package.json",
  );
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as {
    version: string;
  };
  return pkg.version;
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      json: { type: "boolean", default: false },
      update: { type: "boolean", default: false },
      "cache-dir": { type: "string" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(HELP);
    return;
  }

  if (values.version) {
    console.log(getPackageVersion());
    return;
  }

  const chromeVersion = positionals[0] ?? "stable";

  const result = await getChrome({
    version: chromeVersion,
    update: values.update,
    cacheDir: values["cache-dir"],
  });

  if (values.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(result.executablePath);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Error: ${message}\n`);
  if (
    parseArgs({
      args: process.argv.slice(2),
      options: { json: { type: "boolean", default: false } },
      allowPositionals: true,
      strict: false,
    }).values.json
  ) {
    console.log(JSON.stringify({ error: message }));
  }
  process.exitCode = 1;
});
