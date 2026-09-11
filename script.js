// ---------------------------------------------------------------------------
// CookieSMP — shared site behaviour
// ---------------------------------------------------------------------------

const SERVERS = {
  java:    { host: "tissues-paints.tun.ply.gg",   port: 33853 },
  bedrock: { host: "tissues-invented.tun.ply.gg", port: 33862 },
};

/* ---------- copy-to-clipboard on the connect cards ------------------------ */
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".copy-btn");
  if (!btn) return;
  const text = btn.getAttribute("data-copy");
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  const original = btn.textContent;
  btn.textContent = "Copied!";
  btn.classList.add("copied");
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove("copied");
  }, 1800);
});

/* ---------- live status ---------------------------------------------------- */
async function fetchStatus(edition) {
  const { host, port } = SERVERS[edition];
  const url =
    edition === "java"
      ? `https://api.mcstatus.io/v2/status/java/${host}:${port}`
      : `https://api.mcstatus.io/v2/status/bedrock/${host}:${port}`;

  const pill = document.querySelector(`[data-status-pill="${edition}"]`);
  const meta = document.querySelector(`[data-status-meta="${edition}"]`);
  if (!pill) return;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();

    if (data && data.online) {
      pill.className = "status-pill is-online";
      pill.innerHTML = `<span class="dot"></span> Online`;
      if (meta) {
        const players = data.players
          ? `${data.players.online ?? 0}/${data.players.max ?? "?"} players`
          : "player count unavailable";
        const versionName = data.version && (data.version.name_clean ?? data.version.name_raw);
        const version = versionName ? ` &middot; ${escapeHtml(String(versionName))}` : "";
        meta.innerHTML = `<strong>${players}</strong>${version}`;
      }
    } else {
      pill.className = "status-pill is-offline";
      pill.innerHTML = `<span class="dot"></span> Offline`;
      if (meta) meta.textContent = "Server is not responding right now.";
    }
  } catch (err) {
    pill.className = "status-pill is-offline";
    pill.innerHTML = `<span class="dot"></span> Unknown`;
    if (meta) meta.textContent = "Couldn't reach the status service.";
  }
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function initStatusWidgets() {
  const widgets = document.querySelectorAll("[data-status-pill]");
  if (!widgets.length) return;
  widgets.forEach((el) => fetchStatus(el.getAttribute("data-status-pill")));
  setInterval(() => {
    widgets.forEach((el) => fetchStatus(el.getAttribute("data-status-pill")));
  }, 60000);
}

/* ---------- forums ---------------------------------------------------------- */
async function initForums() {
  const list = document.getElementById("post-list");
  if (!list) return;

  let posts = [];
  try {
    const res = await fetch("posts.json", { cache: "no-store" });
    posts = await res.json();
  } catch {
    list.innerHTML = `<div class="empty-state">Couldn't load posts right now — try refreshing.</div>`;
    return;
  }

  posts.sort((a, b) => {
    if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
    return new Date(b.date) - new Date(a.date);
  });

  const tabs = document.querySelectorAll(".filter-tab");
  let activeCat = "all";

  function render() {
    const filtered = posts.filter((p) => activeCat === "all" || p.category === activeCat);
    if (!filtered.length) {
      list.innerHTML = `<div class="empty-state">No posts in this category yet.</div>`;
      return;
    }
    list.innerHTML = filtered
      .map((p) => {
        const date = new Date(p.date);
        const dateStr = isNaN(date)
          ? escapeHtml(p.date || "")
          : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
        return `
          <article class="post-card cat-${escapeHtml(p.category || "announcement")}">
            <div class="post-meta">
              ${p.pinned ? '<span class="post-pin">Pinned</span>' : ""}
              <span class="post-cat">${escapeHtml(p.category || "announcement")}</span>
              <span class="post-date">${dateStr}</span>
              ${p.author ? `<span class="post-author">by ${escapeHtml(p.author)}</span>` : ""}
            </div>
            <h3>${escapeHtml(p.title || "Untitled post")}</h3>
            <p>${escapeHtml(p.body || "")}</p>
          </article>`;
      })
      .join("");
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeCat = tab.getAttribute("data-cat");
      render();
    });
  });

  render();
}

document.addEventListener("DOMContentLoaded", () => {
  initStatusWidgets();
  initForums();
});
