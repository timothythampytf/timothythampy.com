(() => {
  const { CREDITS, SITE } = window;
  const byId = Object.fromEntries(CREDITS.map((c) => [c.id, c]));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const lc = (s) => s.toLowerCase();
  const esc = (s) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
  const pad = (n) => String(n).padStart(2, "0");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  // Credits list Timothy as an artist on many records; on his own site that's implied.
  const byline = (c) => lc(c.artists.filter((a) => a !== "Timothy Thampy").join(", ") || "timothy thampy");

  // ---- mumbai time drives the photo and accent ----
  const mumbaiNow = () => {
    const d = new Date();
    return new Date(d.getTime() + (d.getTimezoneOffset() + 330) * 60000);
  };
  const phaseAt = (d) => {
    const m = d.getHours() * 60 + d.getMinutes();
    if (m >= 7 * 60 && m < 17 * 60) return "day";
    if ((m >= 17 * 60 && m < 19 * 60 + 30) || (m >= 5 * 60 && m < 7 * 60)) return "dusk";
    return "night";
  };
  const phase = new URLSearchParams(location.search).get("sky") || phaseAt(mumbaiNow());
  const sky = SITE.sky[phase] || SITE.sky.dusk;
  document.documentElement.dataset.sky = phase;
  document.documentElement.style.setProperty("--accent", sky.accent);
  const heroImg = $(".hero-photo");
  if (heroImg) heroImg.src = sky.photo;

  const clock = $$(".clock");
  const tick = () => {
    const t = mumbaiNow();
    const h = t.getHours() % 12 || 12;
    const s = `${h}:${pad(t.getMinutes())} ${t.getHours() < 12 ? "am" : "pm"}`;
    clock.forEach((el) => (el.textContent = s));
  };
  if (clock.length) tick(), setInterval(tick, 15000);

  // ---- type that comes into focus: redaction 100 → 50 → 20 → clean ----
  const STEPS = ["100", "50", "20"];
  function resolve(el, delay = 0) {
    if (still) return el.removeAttribute("data-f");
    STEPS.forEach((f, i) => setTimeout(() => (el.dataset.f = f), delay + i * 110));
    setTimeout(() => el.removeAttribute("data-f"), delay + STEPS.length * 110);
  }
  const focusIO = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        focusIO.unobserve(e.target);
        if (e.target.matches(".resolve")) resolve(e.target, +e.target.dataset.delay || 0);
        else e.target.classList.add("in-focus");
      }),
    { threshold: 0.2 }
  );
  const watchFocus = () => {
    $$(".resolve").forEach((el) => {
      if (!still) el.dataset.f = "100";
      // Page titles resolve as soon as the type has loaded; the rest as they scroll in.
      if (el.matches("h1")) (document.fonts?.ready || Promise.resolve()).then(() => resolve(el, +el.dataset.delay || 0));
      else focusIO.observe(el);
    });
    $$(".pull").forEach((el) => focusIO.observe(el));
  };

  // ---- player: one Spotify embed docked at the bottom ----
  const player = $(".player");
  const frame = player && $("iframe", player);
  // id is a track ID, or "album:<id>" for a whole record.
  function play(id, label) {
    const [type, sid] = id.includes(":") ? id.split(":") : ["track", id];
    if (!player) return window.open(`https://open.spotify.com/${type}/${sid}`, "_blank");
    frame.src = `https://open.spotify.com/embed/${type}/${sid}?utm_source=generator&theme=0&autoplay=1`;
    $(".player-title", player).textContent = label;
    player.hidden = false;
    $$("[data-play]").forEach((el) => el.classList.toggle("is-playing", el.dataset.play === id));
  }
  player &&
    $(".player-close", player).addEventListener("click", () => {
      player.hidden = true;
      frame.src = "about:blank";
      $$(".is-playing").forEach((el) => el.classList.remove("is-playing"));
    });
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-play]");
    if (!el) return;
    e.preventDefault();
    play(el.dataset.play, el.dataset.label);
  });

  // ---- a cover that follows the cursor over tracklists ----
  const ghost = $(".ghost");
  if (ghost && finePointer) {
    let x = 0, y = 0, gx = 0, gy = 0, raf = 0;
    const loop = () => {
      gx += (x - gx) * 0.18;
      gy += (y - gy) * 0.18;
      ghost.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      raf = Math.abs(x - gx) + Math.abs(y - gy) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    document.addEventListener("pointermove", (e) => {
      x = e.clientX + 28;
      y = e.clientY - 110;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    document.addEventListener("pointerover", (e) => {
      const row = e.target.closest(".row[data-cover]");
      if (row) {
        $("img", ghost).src = row.dataset.cover;
        ghost.classList.add("on");
      } else ghost.classList.remove("on");
    });
  }

  const row = (c, n) => {
    const note = SITE.notes?.[c.id];
    return `<li><a class="row" href="https://open.spotify.com/track/${c.id}" data-play="${c.id}" data-label="${esc(lc(c.title))}" data-cover="assets/covers/${c.id}.jpg">
      <span class="row-n"><i>${pad(n)}</i><b class="eq" aria-hidden="true"><s></s><s></s><s></s></b></span>
      <span class="row-title">${esc(lc(c.title))}</span>
      <span class="row-meta">${esc(byline(c))}${note ? `<em>${esc(note)}</em>` : ""}</span>
      <span class="row-year">${c.date.slice(0, 4)}</span>
      <img class="row-art" src="assets/covers/${c.id}.jpg" alt="" loading="lazy" width="64" height="64">
    </a></li>`;
  };

  // ---- side a: records for other artists ----
  const work = $("#work-list");
  if (work) work.innerHTML = SITE.selected.map((id) => byId[id]).filter(Boolean).map((c, i) => row(c, i + 1)).join("");
  $$(".credit-count").forEach((el) => (el.textContent = CREDITS.length));
  $$(".selected-count").forEach((el) => (el.textContent = pad(SITE.selected.length)));

  // ---- side b: his songs. hovering one swaps the picture beside it ----
  const songs = $("#songs-list");
  if (songs) {
    const panel = $(".songs-panel img");
    const caption = $(".songs-panel figcaption");
    songs.innerHTML = SITE.own
      .map((r, i) => {
        const secret = !r.title;
        const attrs = r.play ? `href="#" data-play="${r.play}" data-label="${esc(r.title)}"` : `href="#signup"`;
        const cap = secret ? "untitled, 2026" : `${r.title}, ${r.kind.match(/\d{4}/)?.[0] || ""}`;
        return `<li><a class="row row-own${secret ? " row-secret" : ""}" ${attrs} data-image="${r.image}" data-caption="${esc(cap)}">
          <span class="row-n"><i>${pad(i + 1)}</i><b class="eq" aria-hidden="true"><s></s><s></s><s></s></b></span>
          <span class="row-title"${secret ? ' aria-label="untitled"' : ""}>${secret ? "untitled" : esc(r.title)}</span>
          <span class="row-meta">${esc(r.kind)}</span>
        </a></li>`;
      })
      .join("");
    const show = (el) => {
      if (panel.getAttribute("src") === el.dataset.image) return;
      panel.classList.remove("in-focus");
      panel.src = el.dataset.image;
      caption.textContent = el.dataset.caption;
      (panel.decode ? panel.decode() : Promise.resolve()).catch(() => {}).then(() => requestAnimationFrame(() => panel.classList.add("in-focus")));
    };
    $$(".row-own", songs).forEach((el) => {
      el.addEventListener("pointerenter", () => show(el));
      el.addEventListener("focus", () => show(el));
    });
    // The unreleased title never settles.
    const secret = $(".row-secret .row-title", songs);
    if (secret && !still) {
      const glyphs = "abcdefghijklmnopqrstuvwxyz";
      setInterval(() => {
        secret.textContent = Array.from({ length: 10 }, (_, i) => (i === 4 ? " " : glyphs[Math.floor(Math.random() * 26)])).join("");
      }, 140);
    }
  }

  // ---- mailing list for the new release ----
  const signup = $("#signup");
  if (signup) {
    const { formId } = SITE.signup || {};
    const local = ["localhost", "127.0.0.1"].includes(location.hostname);
    const note = $(".signup-note", signup);
    if (formId || local) signup.hidden = false;
    if (formId) signup.action = `https://app.kit.com/forms/${formId}/subscriptions`;
    $(".row-secret", songs || document)?.addEventListener("click", (e) => {
      e.preventDefault();
      signup.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" });
      $("input", signup).focus({ preventScroll: true });
    });
    signup.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!formId) return (note.textContent = "not connected yet. add the kit form id in config.js.");
      const button = $("button", signup);
      button.disabled = true;
      note.textContent = "sending…";
      let res, body;
      try {
        res = await fetch(signup.action, { method: "POST", body: new FormData(signup), headers: { Accept: "application/json" } });
        body = await res.json().catch(() => ({}));
      } catch {
        // Couldn't reach Kit in the background: send the form the old-fashioned way.
        signup.target = "_blank";
        signup.submit();
        note.textContent = "finish signing up in the new tab.";
        button.disabled = false;
        return;
      }
      button.disabled = false;
      if (res.ok && body.status !== "failed") {
        signup.classList.add("is-done");
        note.textContent = "almost. check your inbox to confirm.";
      } else if ((body.errors?.fields || []).includes("email_address")) {
        note.textContent = "that email doesn't look right.";
      } else {
        note.textContent = "something went wrong. try again in a moment.";
      }
    });
  }

  // ---- videos: one screen, a channel list ----
  const screen = $(".screen");
  const channels = $("#channels");
  if (screen && channels) {
    let current = SITE.videos[0];
    const tune = (v) => {
      current = v;
      screen.innerHTML = `<img src="https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg" alt="" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${v.id}/hqdefault.jpg'"><span class="screen-play">▶ play — ${esc(v.title)}</span>`;
      $$("button", channels).forEach((b) => b.classList.toggle("is-on", b.dataset.id === v.id));
    };
    channels.innerHTML = SITE.videos
      .map((v, i) => `<li><button data-id="${v.id}"><span class="row-n"><i>${pad(i + 1)}</i></span><span class="ch-title">${esc(v.title)}</span><span class="ch-by">${esc(v.by)}</span></button></li>`)
      .join("");
    channels.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b) tune(SITE.videos.find((v) => v.id === b.dataset.id));
    });
    // YouTube only loads when asked: keeps the page fast and quiet.
    screen.addEventListener("click", () => {
      if ($("iframe", screen)) return;
      screen.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${current.id}?autoplay=1&rel=0" title="${esc(current.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    });
    tune(current);
  }

  // ---- liner notes: everyone he has made records with, most frequent first ----
  const names = $("#names");
  if (names) {
    const hide = new Set(["Timothy Thampy", ...(SITE.hideFromNotes || [])]);
    const tally = {};
    CREDITS.forEach((c) => c.artists.forEach((a) => !hide.has(a) && (tally[a] = (tally[a] || 0) + 1)));
    const people = Object.entries(tally).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    names.innerHTML = people
      .map(([a, n]) => `<li><a class="row" href="credits.html?q=${encodeURIComponent(lc(a))}"><span class="row-title">${esc(lc(a))}</span>${n > 1 ? `<sup>${n}</sup>` : ""}</a></li>`)
      .join("");
    const years = CREDITS.map((c) => +c.date.slice(0, 4));
    $("#figures").innerHTML = `<span><b>${CREDITS.length}</b> records</span><span><b>${people.length}</b> artists</span><span>since <b>${Math.min(...years)}</b></span>`;
  }

  // The portrait pulls focus as you scroll past, but never quite gets there.
  const portrait = $(".portrait img");
  if (portrait && !still) {
    let queued = false;
    const focusPull = () => {
      queued = false;
      const r = portrait.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.9 + r.height * 0.5)));
      portrait.style.filter = `blur(${(22 - t * 19).toFixed(1)}px)`;
    };
    addEventListener("scroll", () => queued || ((queued = true), requestAnimationFrame(focusPull)), { passive: true });
    focusPull();
  }

  // ---- contact sheet ----
  const sheet = $("#sheet");
  if (sheet) {
    sheet.innerHTML = SITE.photos
      .map((src, i) => `<li><img class="pull" src="${src}" alt="" loading="lazy"><span>${pad(i + 1)}a</span></li>`)
      .join("");
  }

  // ---- credits page ----
  const list = $("#credits-list");
  if (list) {
    const render = (q = "") => {
      q = lc(q.trim());
      const rows = CREDITS.filter((c) => !q || lc(c.title + " " + c.artists.join(" ")).includes(q));
      let year = "";
      list.innerHTML =
        rows
          .map((c, i) => {
            const y = c.date.slice(0, 4);
            const head = y !== year ? `<li class="year" aria-hidden="true">${(year = y)}</li>` : "";
            return head + row(c, rows.length - i);
          })
          .join("") || `<li class="empty">nothing here. yet.</li>`;
      $(".shown-count").textContent = pad(rows.length);
    };
    // credits.html?q=bendi arrives already filtered (linked from the liner notes).
    const search = $("#credits-search");
    const q = new URLSearchParams(location.search).get("q") || "";
    if (search) search.value = q;
    render(q);
    search?.addEventListener("input", (e) => render(e.target.value));
  }

  // ---- contact + footer ----
  const mail = $("#email");
  if (mail) {
    if (SITE.email) {
      mail.href = `mailto:${SITE.email}`;
      mail.textContent = SITE.email;
    } else mail.remove();
  }
  $$(".links").forEach((ul) => {
    ul.innerHTML = Object.entries(SITE.links)
      .filter(([, url]) => url)
      .map(([name, url]) => `<li><a href="${url}" target="_blank" rel="noopener">${name} ↗</a></li>`)
      .join("");
  });
  $$(".year-now").forEach((el) => (el.textContent = new Date().getFullYear()));

  // Top bar: show the small name once the big one has scrolled away.
  const bar = $(".bar");
  const hero = $(".hero");
  if (bar && hero) new IntersectionObserver(([e]) => bar.classList.toggle("past-hero", !e.isIntersecting), { rootMargin: "-40% 0px 0px 0px" }).observe(hero);
  else bar?.classList.add("past-hero");

  // Big type is sized to run exactly edge to edge.
  const fit = () =>
    $$(".fit").forEach((el) => {
      // Measure in the clean cut; the degraded cuts are slightly different widths.
      const f = el.dataset.f;
      delete el.dataset.f;
      el.style.fontSize = "100px";
      const room = el.parentElement.clientWidth - parseFloat(getComputedStyle(el.parentElement).paddingLeft) - parseFloat(getComputedStyle(el.parentElement).paddingRight);
      el.style.fontSize = `${Math.min(100 * (room / el.scrollWidth), +el.dataset.max || 400)}px`;
      if (f) el.dataset.f = f;
    });
  fit();
  document.fonts?.ready.then(fit);
  addEventListener("resize", fit);

  screen?.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), screen.click()));

  watchFocus();
})();
