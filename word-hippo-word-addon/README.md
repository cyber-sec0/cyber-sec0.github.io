# WordHippo Word Add-in

This folder contains a simple Office Add-in wrapper that loads the WordHippo website inside a Word task pane.

## What It Does

- Hosts a lightweight add-in that opens WordHippo in an embedded iframe.
- Provides a button to search selected text from Word in WordHippo.
- Uses the Office JavaScript API (`office.js`) to integrate with Word.

## Files

- `manifest.xml` — Office Add-in manifest file used by Word to install and configure the add-in.
- `index.html` — Add-in web page displayed inside Word's task pane.
- `app.js` — Client-side script for add-in behavior and button interaction.

## Install Locally in Word

> These instructions assume you are on Windows and using a local Office installation.

1. Download or copy the `word-hippo-word-addon` folder to your computer.
2. Right-click the folder and choose `Properties`.
3. Open the `Sharing` tab and click `Share`.
4. Add your Windows user account if needed, then click `Share`.
5. Copy the network path shown, for example:
   - `file://YourComputerName/Users/YourUserName/word-hippo-word-addon`
6. Open Microsoft Word.
7. Go to `File` > `Options`.
8. Select `Trust Center` > `Trust Center Settings...`.
9. Choose `Trusted Add-in Catalogs`.
10. Paste the network path into the `Catalog URL` field and click `Add`.
11. Check `Show in Menu`, then click `OK`.
12. Restart Word.
13. Open the `Add-ins` tab in Word, select the `Shared Folder` catalog, and add the WordHippo add-in.

## Notes

- The add-in depends on an internet connection to load `https://www.wordhippo.com/`.
- If Word does not allow local catalogs, verify your Office version and Trust Center settings.
- For better support, update the `SourceLocation` URL in `manifest.xml` if the add-in files are hosted on a web server.

## Optional Improvements

- Host the `word-hippo-word-addon` folder on a web server and update `manifest.xml` to use the HTTPS URL.
- Add custom logic in `app.js` to capture selected text from the current Word document and pass it to WordHippo.
