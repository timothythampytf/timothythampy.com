// Keeps assets/credits-data.js in step with the "produced by timothy thampy" Spotify playlist.
// Runs daily on GitHub (.github/workflows/sync-credits.yml); can also be run by hand:
//   node scripts/sync-credits.mjs
// It reads Spotify's public embed pages, so no login or API key is needed.

import { readFile, writeFile, access } from "node:fs/promises";
import vm from "node:vm";

const ROOT = new URL("../", import.meta.url);
const DATA = new URL("assets/credits-data.js", ROOT);
const COVERS = new URL("assets/covers/", ROOT);
const UA = { "User-Agent": "Mozilla/5.0 (timothythampy.com credits sync)" };

const load = async (file) => {
  const ctx = { window: {} };
  vm.runInNewContext(await readFile(file, "utf8"), ctx);
  return ctx.window;
};

const embed = async (path) => {
  const res = await fetch(`https://open.spotify.com/embed/${path}`, { headers: UA });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  const html = await res.text();
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
  if (!m) throw new Error(`${path}: page format changed (no __NEXT_DATA__)`);
  return JSON.parse(m[1]).props.pageProps.state.data.entity;
};

const exists = (url) => access(url).then(() => true, () => false);

const { SITE } = await load(new URL("assets/config.js", ROOT));
const { CREDITS: current } = await load(DATA);
const ignore = new Set(SITE.creditsIgnore || []);
const playlistId = SITE.creditsPlaylist.match(/playlist\/(\w+)/)[1];

const playlist = await embed(`playlist/${playlistId}`);
const ids = [...new Set(playlist.trackList.map((t) => t.uri.split(":").pop()))].filter((id) => !ignore.has(id));

// Guard against a broken or half-loaded page wiping the list.
if (ids.length < current.length * 0.5) {
  throw new Error(`playlist returned ${ids.length} tracks but the site has ${current.length}; not touching anything`);
}

const known = Object.fromEntries(current.map((c) => [c.id, c]));
const added = [];
const entries = [];
for (const id of ids) {
  let c = known[id];
  if (!c) {
    const t = await embed(`track/${id}`);
    c = { id, title: t.name, artists: t.artists.map((a) => a.name), date: t.releaseDate.isoString.slice(0, 10) };
    added.push(c);
  }
  const cover = new URL(`${id}.jpg`, COVERS);
  if (!(await exists(cover))) {
    const t = await embed(`track/${id}`);
    const img = t.visualIdentity.image.sort((a, b) => b.maxWidth - a.maxWidth)[0].url;
    const res = await fetch(img, { headers: UA });
    if (!res.ok) throw new Error(`cover for ${id}: HTTP ${res.status}`);
    await writeFile(cover, Buffer.from(await res.arrayBuffer()));
  }
  entries.push(c);
}
const removed = current.filter((c) => !ids.includes(c.id));

// Newest first; ties keep playlist order (sort is stable).
entries.sort((a, b) => b.date.localeCompare(a.date));

const line = (c) =>
  `  { id: ${JSON.stringify(c.id)}, title: ${JSON.stringify(c.title)}, artists: [${c.artists.map((a) => JSON.stringify(a)).join(", ")}], date: ${JSON.stringify(c.date)}${c.own ? ", own: true" : ""} },`;

const out = `// Every record from the "produced by timothy thampy" Spotify playlist, newest first.
// Updated automatically every day by scripts/sync-credits.mjs. Edits here are kept
// for songs still on the playlist; to hide a playlist song, add its ID to creditsIgnore in config.js.
window.CREDITS = [
${entries.map(line).join("\n")}
];
`;

if (out === (await readFile(DATA, "utf8"))) {
  console.log(`no changes (${entries.length} records)`);
} else {
  await writeFile(DATA, out);
  added.forEach((c) => console.log(`+ ${c.title} — ${c.artists.join(", ")}`));
  removed.forEach((c) => console.log(`- ${c.title} — ${c.artists.join(", ")}`));
  console.log(`updated: ${entries.length} records`);
}
