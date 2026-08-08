# cyber-sec0.github.io

A personal GitHub Pages repository for a support website, utility pages, and a Word add-in wrapper.

## Overview

This repository contains a collection of static HTML/CSS/JavaScript pages built for support, translation requests, website monitoring, media utilities, and Office add-in functionality.

## Main Pages

- `index.html`
  - Hacker09 Support page with donation buttons, crypto payment wallet addresses, and a support contact form.
  - Includes a collapsible crypto wallet section, toast notifications, and client-side form redirection via FormSubmit.

- `translation/index.html`
  - Translation services request page with support for English, Portuguese, Spanish, and Japanese.
  - Contains a service request form, budget input, language selector, and links to donation/payment options.

- `monitor/index.html`
  - Website monitor interface for adding and tracking URLs or API endpoints.
  - Supports request headers, request bodies, dynamic token fetching, list comparison methods, and pause/resume behavior.

- `songs.html`
  - YouTube switcher page that loads an embedded video and provides playback controls with a volume overlay.

- `AIMenu.html`
  - Another media utility page focused on embedded video switching and controls.

- `word-hippo-word-addon/`
  - Office Add-in manifest and web UI wrapper for loading WordHippo inside an iframe.
  - Includes `manifest.xml`, `index.html`, and `app.js` for the add-in experience.

## Supporting Files

- `style.css`
  - Shared stylesheet used by the main pages for layout, typography, and visual styling.

- `script.js`
  - Contains site-specific JavaScript for copy-to-clipboard behavior, form submission handling, the crypto toggle, and the animated background.

- `Imgs/`
  - Image assets used throughout the site, such as icons and wallet graphics.

- `UserScripts/`
  - User script and browser extension assets stored here.

- `Videos/`
  - Video-related content or resources that support the site.

## Built With

- HTML
- CSS
- JavaScript
- Tailwind CSS CDN
- Font Awesome icons
- FormSubmit.co for form handling

## Usage

1. Open the desired HTML file in your browser.
2. Edit page contents directly in the corresponding `.html` file.
3. Update styling in `style.css` or page-specific inline styles.
4. Modify JavaScript behavior in `script.js`.

## Customization

- Add or remove monitored URLs in `monitor/index.html` through the page UI.
- Customize the add-in experience in `word-hippo-word-addon/index.html` and `manifest.xml`.

## Notes

- Most pages use client-side JavaScript and do not require a backend server.
- Forms are submitted using external FormSubmit service, so update the action URLs if you want to use a different form backend.

