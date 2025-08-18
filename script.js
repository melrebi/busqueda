(() => {
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const saved = localStorage.getItem("theme");
  const theme = saved ?? (prefersDark ? "dark" : "light");
  setTheme(theme);

  document.getElementById("themeToggle")?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(next);
  });

  function setTheme(mode) {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem("theme", mode);
  }
})();

const $ = (sel, root=document) => root.querySelector(sel);

const resultsEl = $("#results");
const inputEl = $("#searchInput");
const btnEl = $("#searchBtn");
const sheetEl = $("#sheetSelect");
const cardTpl = $("#cardTemplate");
const skeletonTpl = $("#skeletonTemplate");

btnEl.addEventListener("click", performSearch);
inputEl.addEventListener("keypress", (e) => { if (e.key === "Enter") performSearch(); });

function showSkeletons(n = 2) {
  resultsEl.innerHTML = "";
  for (let i = 0; i < n; i++) {
    resultsEl.appendChild(skeletonTpl.content.cloneNode(true));
  }
}

function performSearch() {
  const query = inputEl.value.trim();
  const sheet = sheetEl.value;
  if (!query) {
    resultsEl.innerHTML = `<p class="notice">Por favor, ingrese un texto para buscar.</p>`;
    return;
  }

  showSkeletons();

  const url = new URL(WEB_APP_URL);
  url.searchParams.set("query", query);
  if (sheet) url.searchParams.set("sheet", sheet);

  fetch(url.toString(), { headers: { "Accept": "application/json" } })
    .then(resp => {
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      return resp.json();
    })
    .then(json => displayResults(json))
    .catch(err => {
      console.error(err);
      resultsEl.innerHTML = `<p class="error">Ocurrió un error al buscar: ${err.message || err}</p>`;
    });
}

function displayResults(payload) {
  resultsEl.innerHTML = "";
  const list = Array.isArray(payload?.results) ? payload.results : Array.isArray(payload) ? payload : [];

  if (!list.length) {
    resultsEl.innerHTML = `<div class="empty-state">
      <div class="empty-illu" aria-hidden="true">🗂️</div>
      <h2>Sin resultados</h2>
      <p>Intente con otro valor o verifique la ortografía.</p>
    </div>`;
    return;
  }

  list.forEach(item => {
    const sheet = item.sheet ?? "Resultado";
    const headers = Array.isArray(item.headers) ? item.headers : [];
    const row = Array.isArray(item.row) ? item.row : item;

    const node = cardTpl.content.cloneNode(true);
    $(".sheet-title", node).textContent = `Hoja: ${sheet}`;

    fillSection($(".section-primary .data-grid", node), headers, row, 0, Math.min(5, headers.length));
    if (headers.length > 5) {
      $(".section-secondary", node).classList.remove("hidden");
      fillSection($(".section-secondary .data-grid", node), headers, row, 5, Math.min(20, headers.length));
    }
    if (headers.length > 20) {
      $(".section-tertiary", node).classList.remove("hidden");
      fillSection($(".section-tertiary .data-grid", node), headers, row, 20, headers.length);
    }

    resultsEl.appendChild(node);
  });
}

function fillSection(container, headers, row, start, end) {
  for (let i = start; i < end; i++) {
    const label = document.createElement("div");
    label.className = "data-label";
    label.textContent = (headers[i] ?? `Col ${i+1}`) + ":";

    const value = document.createElement("div");
    value.className = "data-value";
    const cell = row[i] ?? "";
    value.textContent = String(cell);

    container.append(label, value);
  }
}
