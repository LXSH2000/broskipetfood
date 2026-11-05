# Broski

**Treats for your best bro.** A local dog biscuit storefront preview with a warm cream and brown identity, expressive handwritten type and interactive product presentation.

## Open the website

On Windows, double-click `START-WEBSITE.cmd`. It changes to its own folder, installs dependencies when the local Vite executable is missing, builds the latest source, and starts the local server on port **4174**. Open http://127.0.0.1:4174 yourself and keep the terminal open. Press Ctrl+C to stop.

Node.js and npm must be on PATH. Use a Node.js version compatible with the installed Vite package; its requirement is recorded in `node_modules/vite/package.json` under `engines`. The first dependency installation requires network access.

For a fresh build, run these commands in PowerShell:

```powershell
Set-Location 'D:\CHATGPT AI TEAM\dog biscuit website'
npm install
npm run build
$env:PORT = '4174'
npm start
```

The helper reuses an existing build. After changing source files or public assets, run `npm run build` again before restarting. `npm run dev` starts Vite for source development; `npm start` serves the built site with its local API.

## Preview checkout

Checkout records demo orders locally. It does **not** charge a payment method, dispatch products or notify a fulfilment provider. Use fictional test contact details. The server writes order data under `data/orders.json` by default; `DATA_DIR` can point to another directory. This local JSON store is not a production order-management system.

The server binds to `127.0.0.1`, so this is a local preview, not a public deployment. If port 4174 is occupied, stop the previous server or set another `PORT` in PowerShell before `npm start`.

## Checks and owner handoff

Run `npm test` for the supplied server tests and `npm run build` to check the production bundle. Passing these checks does not establish production commerce readiness. See `HANDOFF.md` for owner inputs and release checks, `BRAND.md` for the identity, and `ASSET_NOTES.md` for supplied image provenance where recorded.
