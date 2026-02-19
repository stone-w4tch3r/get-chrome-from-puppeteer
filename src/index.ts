import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  Browser,
  type BrowserPlatform,
  computeExecutablePath,
  detectBrowserPlatform,
  getInstalledBrowsers,
  install,
  resolveBuildId,
} from "@puppeteer/browsers";

export interface GetChromeOptions {
  /** Chrome version: "stable" (default), "canary", "beta", "dev", "130", "130.0.6723.58" */
  version?: string;
  /** Re-install if a newer build is available for the requested version tag. Default: false */
  update?: boolean;
  /** Custom cache directory. Default: system-appropriate cache dir */
  cacheDir?: string;
}

export interface GetChromeResult {
  executablePath: string;
  buildId: string;
}

function getDefaultCacheDir(): string {
  const homeDir = os.homedir();
  switch (os.platform()) {
    case "darwin":
      return path.join(homeDir, "Library", "Caches", "puppeteer-browsers");
    case "win32":
      return path.join(
        process.env["LOCALAPPDATA"] ||
          path.join(homeDir, "AppData", "Local"),
        "puppeteer-browsers",
      );
    default:
      return path.join(
        process.env["XDG_CACHE_HOME"] || path.join(homeDir, ".cache"),
        "puppeteer-browsers",
      );
  }
}

export async function getChrome(
  options?: GetChromeOptions,
): Promise<GetChromeResult> {
  // Check GET_CHROME_PATH env var override
  const envPath = process.env["GET_CHROME_PATH"];
  if (envPath && fs.existsSync(envPath)) {
    return { executablePath: envPath, buildId: "custom" };
  }

  const version = options?.version ?? "stable";
  const update = options?.update ?? false;
  const cacheDir = options?.cacheDir ?? getDefaultCacheDir();

  const platform = detectBrowserPlatform() as BrowserPlatform;
  if (!platform) {
    throw new Error("Unable to detect browser platform");
  }

  const buildId = await resolveBuildId(Browser.CHROME, platform, version);

  // If not updating, check if already installed
  if (!update) {
    const installed = await getInstalledBrowsers({ cacheDir });
    const existing = installed.find(
      (b) => b.browser === Browser.CHROME && b.buildId === buildId,
    );
    if (existing) {
      return { executablePath: existing.executablePath, buildId };
    }
  }

  // Install (idempotent — skips download if already present)
  const result = await install({
    browser: Browser.CHROME,
    buildId,
    cacheDir,
    downloadProgressCallback: "default",
  });

  return { executablePath: result.executablePath, buildId };
}
