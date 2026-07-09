# Deploying with `clasp` (recommended, fastest path)

`clasp` is Google's official CLI for pushing local files to an Apps Script
project and deploying it — three commands instead of manually pasting five
files into the browser editor. It authenticates as **you**, via your own
browser-based Google login; nothing is shared with anyone else.

Run all of this **on your own machine**, in a clone of this repo.

## 1. Install and log in (one-time)

```bash
npm install -g @google/clasp
clasp login
```

This opens your browser for a normal Google OAuth consent screen (asking for
Drive/Sheets/Apps Script access) tied to your own Google account. The
resulting credentials are stored locally at `~/.clasprc.json` — they never
leave your machine.

## 2. Create the Apps Script project (one-time)

You need a Script ID before you can push. Easiest way — create an empty
project in the browser and grab its ID:

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. Rename it, e.g. "WDCW Peddapalli Recruitment Portal".
3. **Project Settings** (gear icon) → copy the **Script ID** shown there.
4. In this repo, open `.clasp.json` and replace `PASTE_YOUR_SCRIPT_ID_HERE`
   with that Script ID:
   ```json
   {
     "scriptId": "1AbCdEfGhIjKlMnOpQrStUvWxYz...",
     "rootDir": "."
   }
   ```

(Alternatively, `clasp create --type webapp --title "..." --rootDir .` can
create the project for you and write `.clasp.json` automatically — but if it
complains that `appsscript.json` already exists, use the manual steps above
instead.)

## 3. Push the code

From the repo root:

```bash
clasp push
```

This uploads `Code.gs`, `appsscript.json`, `Index.html`, `Stylesheet.html`,
and `JavaScript.html` (per `.claspignore`, everything else — README,
the GitHub Pages `index.html`, `style.css`, `script.js` — is excluded since
Apps Script doesn't serve those file types anyway).

## 4. Set the admin password (one-time, still needs the browser)

`clasp` can't set Script Properties. Open the project (`clasp open`), then:
**Project Settings → Script Properties → Add script property** →
Key: `ADMIN_PASSWORD`, Value: your chosen password.

## 5. Enable the Drive API advanced service (one-time, still needs the browser)

Also still a browser step: in the Apps Script editor, **Services (+)** →
add **Drive API**, identifier `Drive`, version `v2` (already declared in
`appsscript.json`, but the advanced service toggle itself is a UI action
clasp can't do for you).

## 6. Deploy

```bash
clasp deploy --description "v1"
```

`appsscript.json` already declares `"executeAs": "USER_DEPLOYING"` and
`"access": "ANYONE_ANONYMOUS"`, so the deployment is created with the right
access settings automatically — no manual toggling needed in the UI.

To get the actual web app URL to share with applicants:

```bash
clasp open --webapp
```

This opens the live running web app in your browser — copy that URL. Then
open this repo's `index.html` (the GitHub Pages landing page), set
`LIVE_APP_URL` to that link, and commit — the "Open Application Portal"
button will go live.

## Updating later

Whenever you edit `Code.gs`/`Index.html`/etc. and want to push a new version:

```bash
clasp push
clasp deploy --description "v2"
```

`clasp push` alone updates the underlying script but does **not** change what
the existing deployment URL serves — you need a fresh `clasp deploy` (or
`clasp deploy --deploymentId <id>` to update a specific deployment in place)
for changes to reach the live URL.
