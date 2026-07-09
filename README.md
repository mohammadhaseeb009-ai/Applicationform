# Applicationform — WD&CW Peddapalli Online Recruitment Portal

Job application form for Peddapalli District — a complete,
production-ready Government Recruitment Web Application for the
**Women Development and Child Welfare Department, Peddapalli District,
Government of Telangana** — built entirely on **Google Apps Script**, so it
needs no external server, database, or hosting.

## What's in this project

| File | Purpose |
|---|---|
| `Code.gs` | Server-side logic: form submission, validation, Drive uploads, PDF generation, email, admin panel, sheet setup |
| `appsscript.json` | Apps Script manifest (scopes, Drive advanced service, web app config) |
| `Index.html` | The single web app page (header, application form, applicant dashboard, admin panel, footer) |
| `Stylesheet.html` | CSS, included into `Index.html` via `<?!= include('Stylesheet'); ?>` |
| `JavaScript.html` | Client-side JS, included into `Index.html` via `<?!= include('JavaScript'); ?>` |
| `style.css` / `script.js` | Plain-text mirrors of the CSS/JS above, kept for easy editing outside the Apps Script editor. **Google Apps Script only serves `.html`, `.gs` and `.json` files** — so when you paste content into the Apps Script editor, `style.css` goes inside `Stylesheet.html`'s `<style>` tag and `script.js` goes inside `JavaScript.html`'s `<script>` tag. This repo already has both wired up correctly; you only need `style.css`/`script.js` if you want to edit styling/logic in a plain-text editor first. |
| `index.html` (lowercase) | A **static GitHub Pages landing page only** — not part of the app itself. See "GitHub Pages" section below. Don't confuse it with `Index.html` (capital I), which is the real Apps Script template and the one you paste into the Apps Script editor. |

---

## 0. GitHub Pages note (important)

This repository's actual application (`Index.html`, `Stylesheet.html`, `JavaScript.html`,
`Code.gs`) is a **Google Apps Script web app**. It cannot run as a static site —
it depends on Apps Script's server runtime for everything (Sheets/Drive/Gmail
access, `doGet()`, `google.script.run` calls). GitHub Pages only serves static
files, so it can never execute `Code.gs` or process the `<?!= ... ?>`
scriptlets in `Index.html`.

The lowercase `index.html` at the repo root exists purely so that if you
enable GitHub Pages for this repo (**Settings → Pages → Source: `main` branch,
`/ (root)` folder**), visitors land on an explanatory page instead of a 404,
with a link out to the real deployment and to the deployment guide below.

Once you've deployed the real Apps Script web app (Section 3), open
`index.html`, replace the empty `LIVE_APP_URL` constant near the bottom with
your `https://script.google.com/macros/s/.../exec` URL, and commit — the
"Open Application Portal" button will then link to the live app.

## 1. Google Sheet setup

1. Open the target spreadsheet:
   `https://docs.google.com/spreadsheets/d/1q0-fKfad1CgrNBe6rUDkHvniYfJJDqnHl8srM00VFCg/edit`
2. You don't need to create any sheet or headers manually — the first time
   the app runs, `Code.gs` automatically creates a sheet named
   **`Applications`** and writes the full header row (68 columns matching
   every field in the form, including `Submission Date`, `Submission Time`,
   `Application Number`, and `Status`).
3. If you want to point the app at a different spreadsheet, change
   `SPREADSHEET_ID` at the top of `Code.gs`.

## 2. Google Drive setup

No manual folder creation needed. On first upload, `Code.gs` automatically
creates:

```
My Drive
└── WDCW Peddapalli Recruitment - Uploads
    ├── Photos
    ├── Signatures
    ├── Certificates
    └── Generated Applications (PDF)
```

All uploaded files (and generated PDFs) are stored here, shared as
"Anyone with the link can view" so the admin panel and applicant dashboard
can preview/download them without extra permission grants. Change the
sharing behaviour in `saveBase64File_()` in `Code.gs` if your department
requires tighter access control (e.g. restrict to your Google Workspace
domain).

## 3. Deploying as a Google Apps Script Web App

**Prefer the command line?** See [`DEPLOY_WITH_CLASP.md`](./DEPLOY_WITH_CLASP.md)
for a `clasp login` / `clasp push` / `clasp deploy` workflow (3 commands,
run from your own machine with your own Google login) instead of the manual
copy-paste steps below.

1. Go to [script.google.com](https://script.google.com) → **New Project**.
2. Rename the project (e.g. "WDCW Peddapalli Recruitment Portal").
3. Delete the default `Code.gs` content and paste in this repo's `Code.gs`.
4. Create these additional files in the Apps Script editor (**+ → Html** for
   each, then **+ → Script** is not needed since manifest is edited via
   **Project Settings**):
   - `Index.html` → paste this repo's `Index.html`
   - `Stylesheet.html` → paste this repo's `Stylesheet.html`
   - `JavaScript.html` → paste this repo's `JavaScript.html`
5. Open **Project Settings** (gear icon) → check **"Show appsscript.json
   manifest file in editor"**. Open `appsscript.json` in the editor and
   replace its content with this repo's `appsscript.json`.
6. Enable the **Drive API advanced service** (required for HTML→PDF
   conversion):
   - In the Apps Script editor, click **Services (+)** next to "Editor" in
     the left sidebar.
   - Add **Drive API**, keep the identifier as `Drive`, version `v2`. (This
     is already declared in `appsscript.json`, but Apps Script also needs
     the matching Google Cloud project API enabled — the editor will
     prompt/link you to enable it in Cloud Console if needed.)
7. **Set the admin password** (important — do this before sharing the link):
   - In the Apps Script editor: **Project Settings → Script Properties →
     Add script property**.
   - Key: `ADMIN_PASSWORD`, Value: a strong password of your choice.
   - If you skip this step, the app falls back to the default password
     `Peddapalli@2026` defined in `Code.gs` (`DEFAULT_ADMIN_PASSWORD`) —
     change it immediately in production.
8. Click **Deploy → New deployment**.
   - Select type: **Web app**.
   - Description: e.g. "v1".
   - Execute as: **Me** (your account — this is what lets the script write
     to the Sheet/Drive and send email on behalf of the department account).
   - Who has access: **Anyone** (public applicants) — or **Anyone within
     [your organization]** if you want to restrict access to a Google
     Workspace domain.
   - Click **Deploy**, authorize the requested permissions (Sheets, Drive,
     Gmail/MailApp, external requests for Excel export).
9. Copy the **Web app URL** — this is the public link to the recruitment
   portal. Share it with applicants.
10. Whenever you edit the code, use **Deploy → Manage deployments → Edit
    (pencil) → New version** to push updates to the same URL.

## 4. Google Drive & Sheets permissions

The script runs as **you** (the deploying account), so that Google account
must own or have edit access to:
- The target spreadsheet (`SPREADSHEET_ID`).
- Its own Drive (for the upload folders, created automatically).

No API keys, service accounts, or external backend are required — Apps
Script's built-in `SpreadsheetApp`, `DriveApp`, `MailApp`, and the `Drive`
advanced service handle everything.

## 5. How core features work

- **Application Number**: Sequential, per year, in the format
  `WDCW-PDP-2026-000001`, generated with `LockService` to prevent
  duplicates/races under concurrent submissions (`generateApplicationNumber()`
  in `Code.gs`). The number shown on the form before submission is a
  *preview* only; the authoritative number is assigned at the moment of
  successful submission.
- **Duplicate prevention**: Aadhaar, Mobile, and Email are checked against
  existing sheet rows both live (on blur, via `checkDuplicate()`) and again
  server-side at submission time.
- **File uploads**: Read client-side as base64 via `FileReader`, validated
  for type/size in the browser *and* re-validated server-side, then decoded
  and saved to the correct Drive subfolder.
- **PDF generation**: A full HTML rendering of the application is converted
  to a Google Doc (via the Drive v2 advanced service's HTML→Docs import),
  exported as PDF, saved to Drive, and the temporary Doc is trashed. This
  uses no external PDF library — 100% Apps Script.
- **Email confirmation**: Sent via `MailApp.sendEmail()` immediately after a
  successful submission, containing Application Number, Applicant Name,
  Applied Post, and Submission Date.
- **Admin panel**: Password-protected (`adminLogin()`), issuing a short-lived
  session token cached server-side (`CacheService`, 6 hours) — the password
  itself is never stored in the browser. Supports search, status filter,
  position filter, status changes (Pending/Verified/Rejected/Selected),
  per-applicant detail view, per-applicant PDF, and full Excel export of the
  sheet.
- **Applicant dashboard**: Looks up an application by **Application Number +
  registered Mobile Number together** (not by number alone) to prevent
  anyone from browsing other applicants' data by guessing sequential
  numbers.

## 6. Customization notes

- **Header logos**: `Index.html` currently uses placeholder logo images
  (`#emblemLogo` for the Telangana State Emblem, `#deptLogo` for the WD&CW
  Department logo) with clear HTML comments marking them as placeholders.
  Replace the `src` attributes with your department's official hosted logo
  URLs (or upload the images to Drive, publish them, and use the public
  URLs) whenever they're available.
- **Vacancy list**: Edit `POSITION_LIST` in `Code.gs`.
- **Admin statuses**: Edit the status list in `updateApplicationStatus()`
  (`Code.gs`) and the `<option>` list in `Index.html`/`JavaScript.html` if
  you need different workflow states.
- **Document upload list**: Edit `DOCUMENT_FIELDS` in `Code.gs` — the
  upload rows in Section 9 are rendered dynamically from this same config
  on the client, so you only need to change it in one place (plus the
  matching PDF/section rendering already reads generically from it).

## 7. Testing checklist before go-live

- [ ] Submit a full test application (fill every section, upload every
      document) and confirm a row appears in the `Applications` sheet.
- [ ] Confirm Drive folders were created and contain the uploaded files.
- [ ] Confirm the confirmation email arrives at the test applicant address.
- [ ] Confirm "Download PDF" produces a correctly formatted PDF.
- [ ] Log into the Admin Panel with the configured password, change a
      status, and confirm it's reflected in the sheet.
- [ ] Export to Excel from the Admin Panel and open the file.
- [ ] Search for the test application from "My Application" using the
      Application Number + Mobile Number.
- [ ] Re-submit the same Aadhaar/Mobile/Email and confirm duplicate
      rejection.
- [ ] Test on a mobile device / narrow browser window for responsiveness.
