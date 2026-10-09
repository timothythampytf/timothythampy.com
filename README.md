# timothythampy.com

Plain HTML/CSS/JS. No build step.

- `index.html`: home (work, music, videos, about, contact)
- `credits.html`: every production credit, searchable
- `assets/config.js`: email, social links, side a / side b, videos, contact-sheet photos, and the time-of-day photos
- `assets/fonts/`: Redaction (and its degraded cuts) and Fragment Mono, both SIL Open Font License
- `assets/credits-data.js`: the full credits list (from the "produced by timothy thampy" Spotify playlist)
- `assets/photos/`, `assets/covers/`: images

## Preview locally

```bash
python3 -m http.server 4890
```

Then open http://localhost:4890. The opening photo follows the time in Mumbai; add `?sky=day`, `?sky=dusk` or `?sky=night` to preview each one.

## Add a new credit

1. Save the cover as `assets/covers/<spotify-track-id>.jpg`.
2. Add a line at the top of `assets/credits-data.js`.
3. To feature it on the home page, add the ID to `selected` in `assets/config.js`.

## Deploy

Hosted on GitHub Pages from the `main` branch of github.com/timothythampytf/timothythampy.com.
Commit and push to `main` and the live site updates within a minute or two.

DNS (at Squarespace Domains) points `timothythampy.com` to GitHub Pages:
A records 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153,
and `www` as a CNAME to `timothythampytf.github.io`.
