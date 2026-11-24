# A Little Garden for Lablab

A static, animated tulip garden for our 22nd monthsary. Tap **Let love bloom** to grow nine pink tulips, start a gentle music-box melody, and reveal a Taglish love note.

Built with HTML, CSS, JavaScript, and SVG. No framework, build step, API keys, backend, or accounts are required. The complete website is in `dist/`.

## Preview locally

From this directory, run:

```sh
npx --yes serve dist
```

Open the local URL printed by the command. You can also open `dist/index.html` directly. Google Fonts requires internet access; the site includes local system-font fallbacks. Music starts after a user gesture.

## GitHub Pages

Live website: https://likenmuff.github.io/tulip22/

GitHub Pages publishes the root of the `gh-pages` branch. The `main` branch contains the source website in `dist/`, documentation, and a workflow that checks JavaScript syntax.

After editing the site, commit the changes and publish the static files:

```sh
git add dist
git commit -m "Update the garden"
git push origin main
git subtree push --prefix dist origin gh-pages
```

GitHub automatically deploys changes pushed to `gh-pages`. In repository **Settings → Pages**, keep **Deploy from a branch**, **gh-pages**, and **/(root)** selected. The subtree command exports only the website files, with no build step.

All asset links are relative, so the site works under a repository subpath. When using a different domain, update the absolute `og:url` and `og:image` values in `dist/index.html` for shared-link previews.

## Personalize

- Edit the greeting and Taglish letter in `dist/index.html`.
- Adjust the palette and responsive styles in `dist/style.css`.
- Change flower placement, animation, and the original synthesized melody in `dist/garden.js`.
- Replace `dist/social-preview.png` when the visual design changes.

The site includes replay, pause, and music controls; keyboard focus indicators; and a reduced-motion presentation. It has been checked at desktop, 375px and 320px phone widths, and landscape sizes.

`.openai/hosting.json` records the original Sites publication. GitHub Pages deploys only `dist/` and does not use that manifest. Local browser-check tooling and screenshots are ignored by Git.
