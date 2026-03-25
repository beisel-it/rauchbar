const body = document.body;
const screenshotToggle = document.querySelector("#screenshot-toggle");

function applyScreenshotMode(enabled) {
  body.dataset.screenshot = enabled ? "true" : "false";
  if (screenshotToggle) {
    screenshotToggle.checked = enabled;
  }
}

function applyHomeState(state) {
  if (body.dataset.page !== "homepage") {
    return;
  }

  body.dataset.homeState = state;

  const cards = Array.from(document.querySelectorAll("[data-card]"));
  const archiveGrid = document.querySelector("[data-archive-grid]");
  const archiveEmpty = document.querySelector("[data-archive-empty]");
  const metricsPanel = document.querySelector("[data-metrics-panel]");

  cards.forEach((card, index) => {
    const showCard = state === "default" || state === "metrics-fallback" || (state === "sparse" && index === 0);
    card.classList.toggle("hidden", !showCard);
  });

  if (archiveGrid) {
    archiveGrid.classList.toggle("hidden", state === "empty");
  }

  if (archiveEmpty) {
    archiveEmpty.classList.toggle("hidden", state !== "empty");
  }

  if (metricsPanel) {
    if (state === "metrics-fallback") {
      metricsPanel.innerHTML = `
        <p class="panel-label">Proof of cadence</p>
        <h2>Live-Metriken fehlen gerade</h2>
        <p>Die Wertlogik bleibt gleich: taegliches Monitoring, member-first Freigabe und kuratierte Signale.</p>
      `;
    } else {
      metricsPanel.innerHTML = `
        <p class="panel-label">Proof of cadence</p>
        <h2>Letzte Woche</h2>
        <dl class="metrics-list">
          <div>
            <dt>Deals entdeckt</dt>
            <dd>41</dd>
          </div>
          <div>
            <dt>Shops beobachtet</dt>
            <dd>9</dd>
          </div>
          <div>
            <dt>Hot-Deal-Treffer</dt>
            <dd>7</dd>
          </div>
        </dl>
      `;
    }
  }
}

document.querySelectorAll("[data-home-switch]").forEach((button) => {
  button.addEventListener("click", () => applyHomeState(button.dataset.homeSwitch || "default"));
});

if (screenshotToggle) {
  screenshotToggle.addEventListener("change", () => {
    applyScreenshotMode(screenshotToggle.checked);
  });
}

const params = new URLSearchParams(window.location.search);
applyScreenshotMode(params.get("screenshot") === "1");
applyHomeState(params.get("state") || "default");
