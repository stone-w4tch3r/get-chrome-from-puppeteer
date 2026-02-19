# get-chrome-from-puppeteer

Install [Chrome for Testing](https://developer.chrome.com/blog/chrome-for-testing/) via [`@puppeteer/browsers`](https://pptr.dev/browsers-api) and return its executable path.

## Install

```bash
npm install get-chrome-from-puppeteer
```

## CLI

```bash
# Get Chrome stable (default) — prints the executable path
npx get-chrome-from-puppeteer

# Specific version
npx get-chrome-from-puppeteer 130
npx get-chrome-from-puppeteer 130.0.6723.58

# Channels
npx get-chrome-from-puppeteer canary
npx get-chrome-from-puppeteer beta

# JSON output
npx get-chrome-from-puppeteer --json

# Re-install if newer build available
npx get-chrome-from-puppeteer --update

# Custom cache directory
npx get-chrome-from-puppeteer --cache-dir /tmp/browsers
```

### Shell integration

```bash
# Use in scripts
CHROME=$(npx -y get-chrome-from-puppeteer)
$CHROME --headless --dump-dom https://example.com
```

### Options

| Option               | Description                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| `[version]`          | Chrome version: `stable` (default), `canary`, `beta`, `dev`, milestone (`130`), exact (`130.0.6723.58`) |
| `--json`             | Output as JSON `{ executablePath, buildId }`                                                            |
| `--update`           | Re-install if a newer build is available                                                                |
| `--cache-dir <path>` | Custom cache directory                                                                                  |
| `--help, -h`         | Show help                                                                                               |
| `--version, -v`      | Show package version                                                                                    |

### Environment variables

| Variable          | Description                          |
| ----------------- | ------------------------------------ |
| `GET_CHROME_PATH` | Skip install, use this path directly |

## Programmatic API

```typescript
import { getChrome } from "get-chrome-from-puppeteer";

const { executablePath, buildId } = await getChrome();
console.log(executablePath);
// /home/user/.cache/puppeteer-browsers/chrome/linux-130.0.6723.58/chrome-linux64/chrome

// With options
const result = await getChrome({
  version: "canary",
  update: true,
  cacheDir: "/tmp/browsers",
});
```

### `getChrome(options?): Promise<GetChromeResult>`

#### Options

| Option     | Type      | Default        | Description                                      |
| ---------- | --------- | -------------- | ------------------------------------------------ |
| `version`  | `string`  | `"stable"`     | Chrome version tag, milestone, or exact build ID |
| `update`   | `boolean` | `false`        | Re-install if a newer build is available         |
| `cacheDir` | `string`  | system default | Custom cache directory                           |

#### Result

| Field            | Type     | Description                                                                         |
| ---------------- | -------- | ----------------------------------------------------------------------------------- |
| `executablePath` | `string` | Absolute path to the Chrome executable                                              |
| `buildId`        | `string` | Resolved build ID (e.g. `"130.0.6723.58"`) or `"custom"` if using `GET_CHROME_PATH` |

## License

MIT
