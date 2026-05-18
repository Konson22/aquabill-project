# How to create a Word document (.docx) from the client orientation

AquaBill ships the client orientation as:

- **`SYSTEM_ORIENTATION.md`** — full text, best for **Git**, **GitHub**, and **technical editors**.
- **`SYSTEM_ORIENTATION.html`** — **Microsoft Word–friendly** layout for a polished **.docx** or **PDF**.

## Steps (Microsoft Word on Windows or Mac)

1. In File Explorer (or Finder), go to the `docs` folder in your project copy.
2. **Right‑click** `SYSTEM_ORIENTATION.html` → **Open with** → **Microsoft Word**  
   (or from Word: **File → Open** and choose the HTML file).
3. Review formatting; adjust fonts or corporate cover page if your organisation requires it.
4. **File → Save As** → choose **Word Document (*.docx)**.  
   Optional: **File → Save As** → **PDF** for a non-editable handout.

## Why HTML instead of a bundled .docx?

The repository stays lightweight and **diff‑friendly**. HTML opens reliably in Word and avoids binary merge conflicts. If you need an automated `.docx` build in CI, your IT team can add **Pandoc** or **PhpWord** on the build server.

## Keeping the Word copy up to date

When you change **`SYSTEM_ORIENTATION.md`**, either:

- Re‑export by refreshing the HTML (if you maintain both by hand), or  
- Ask your IT team to automate **Markdown → HTML** or **Markdown → docx** as part of release packaging.

---

*Internal note for AquaBill documentation maintainers.*
