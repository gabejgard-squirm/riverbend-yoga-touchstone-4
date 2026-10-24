# Riverbend Yoga Studio Touchstone 4

This repository contains the Touchstone 4 version of the Riverbend Yoga Studio coursework website. It builds on the earlier HTML and CSS website by adding a class finder, form validation, and browser storage. It uses four HTML pages, one shared CSS file, and one JavaScript file.

The HTML and CSS version remains in the separate [Touchstone 3 repository](https://github.com/gabejgard-squirm/riverbend-yoga). You can also [view the Touchstone 3 website](https://gabejgard-squirm.github.io/riverbend-yoga/).

Public website: https://gabejgard-squirm.github.io/riverbend-yoga-touchstone-4/

## Run in GitHub Codespaces

1. Open this repository on GitHub.
2. Choose **Code > Codespaces > Create codespace on main**.
3. In the Codespaces terminal, from the folder containing `index.html`, run:

   ```sh
   python3 -m http.server 8000
   ```

4. Open the **Ports** tab. Open port **8000** in a browser.
5. To share the running preview with a reviewer, change port 8000 visibility to **Public**, then copy its forwarded address. Test it in a private browser window. The codespace must remain running for this preview to be available.

## Check the features

- On **Yoga Classes**, choose an experience and goal, then click **Find a class**. The result changes without navigating away.
- Refresh the page. The saved experience, goal, and suggestion return from `localStorage`.
- Click the suggestion's inquiry link. The Events form starts with the suggested class and experience selected.
- Submit incomplete or incorrect form entries. Errors appear beside each relevant field without clearing the entries.
- Choose **Phone** as the preferred contact method. A phone number is required for that choice.
- Correct the fields and click **Check my inquiry**. A confirmation appears; no network submission or booking occurs.
- Change class, experience, or contact method, then refresh. These preferences return. Name, email, phone, and message are not stored.
- **Clear form** clears the inquiry fields and saved inquiry preferences. **Forget saved choices** on Services clears all saved preferences.

## Files

- `index.html`: home page
- `services.html`: classes, class finder, and breathing audio
- `about.html`: instructors, accommodations, and policies
- `events.html`: workshops and inquiry form
- `styles.css`: shared responsive design
- `script.js`: recommendations, validation, and local browser storage
- `Yoga_assets_extracted/Yoga_c/`: provided images and breathing audio

The form is a client-side coursework demonstration. It validates inquiries but does not send messages, take payments, or reserve places.

