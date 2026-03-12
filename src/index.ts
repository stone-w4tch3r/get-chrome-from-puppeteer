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
  /** Install system-level dependencies (Debian/Ubuntu only, requires root). Default: false */
  installDeps?: boolean;
  /** Custom download base URL (e.g. corporate mirror). Default: Google's CDN */
  baseUrl?: string;
  /** Suppress download progress output. Default: false */
  quiet?: boolean;
  /** Only return path if already installed, don't download. Default: false */
  pathOnly?: boolean;
  /** Install Chromium instead of Chrome for Testing. Default: false */
  chromium?: boolean;
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
  const isChromium = options?.chromium ?? false;
  const browser = isChromium ? Browser.CHROMIUM : Browser.CHROME;
  const defaultVersion = isChromium ? "latest" : "stable";
  const version = options?.version ?? defaultVersion;
  const update = options?.update ?? false;
  const cacheDir = options?.cacheDir ?? getDefaultCacheDir();

  const platform = detectBrowserPlatform() as BrowserPlatform;
  if (!platform) {
    throw new Error("Unable to detect browser platform");
  }

  const buildId = await resolveBuildId(browser, platform, version);

  // Check if already installed
  const installed = await getInstalledBrowsers({ cacheDir });
  const existing = installed.find(
    (b) => b.browser === browser && b.buildId === buildId,
  );

  if (existing && !update) {
    return { executablePath: existing.executablePath, buildId };
  }

  if (options?.pathOnly) {
    if (existing) {
      return { executablePath: existing.executablePath, buildId };
    }
    throw new Error(`Chrome ${buildId} is not installed (use without --path-only to download)`);
  }

  // Install (idempotent — skips download if already present)
  const result = await install({
    browser,
    buildId,
    cacheDir,
    unpack: true as const,
    installDeps: options?.installDeps ?? false,
    ...(!options?.quiet && { downloadProgressCallback: "default" as const }),
    ...(options?.baseUrl && { baseUrl: options.baseUrl }),
  });

  return { executablePath: result.executablePath, buildId };
}
