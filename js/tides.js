// Vice Charters — live Biscayne Bay tide chart
// Data source: NOAA CO-OPS Tides & Currents API (public, no key required)
// Station 8723214 = Virginia Key, Biscayne Bay, FL
// Docs: https://api.tidesandcurrents.noaa.gov/api/prod/

const NOAA_STATION = "8723214"; // Virginia Key, Biscayne Bay, FL
const NOAA_BASE = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";

function pad(n) {
  return String(n).padStart(2, "0");
}

function dateStr(d) {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

function buildUrl(params) {
  const usp = new URLSearchParams({
    station: NOAA_STATION,
    product: "predictions",
    datum: "MLLW",
    time_zone: "lst_ldt", // local standard/daylight time — NOT "lst_ld", that value 400s
    units: "english",
    format: "json",
    application: "vice_charters_site",
    ...params,
  });
  return `${NOAA_BASE}?${usp.toString()}`;
}

async function fetchTideData() {
  const now = new Date();
  const end = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const begin = dateStr(now);
  const endStr = dateStr(end);

  const [curveRes, hiloRes] = await Promise.all([
    fetch(buildUrl({ begin_date: begin, end_date: endStr, interval: "h" })),
    fetch(buildUrl({ begin_date: begin, end_date: endStr, interval: "hilo" })),
  ]);

  if (!curveRes.ok || !hiloRes.ok) {
    throw new Error("NOAA API request failed");
  }

  const curveJson = await curveRes.json();
  const hiloJson = await hiloRes.json();

  if (curveJson.error || hiloJson.error) {
    throw new Error(
      (curveJson.error && curveJson.error.message) ||
        (hiloJson.error && hiloJson.error.message) ||
        "NOAA API returned an error"
    );
  }

  return {
    curve: curveJson.predictions || [],
    hilo: hiloJson.predictions || [],
  };
}

function formatTime(dateStr) {
  // NOAA format: "2026-08-19 06:12"
  const d = new Date(dateStr.replace(" ", "T"));
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function renderTideChart(canvasEl, curve) {
  const labels = curve.map((p) => formatTime(p.t));
  const values = curve.map((p) => parseFloat(p.v));

  // eslint-disable-next-line no-undef
  new Chart(canvasEl, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Predicted tide height (ft, MLLW)",
          data: values,
          fill: true,
          borderColor: "#2fb6c6",
          backgroundColor: "rgba(47,182,198,0.12)",
          pointRadius: 0,
          borderWidth: 2.5,
          tension: 0.35,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1c1f26",
          titleColor: "#f5f5f7",
          bodyColor: "#c7cbd4",
          borderColor: "#333a47",
          borderWidth: 1,
          callbacks: {
            label: (ctx) => `${ctx.parsed.y.toFixed(2)} ft`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#8a91a0", maxTicksLimit: 8 },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
        y: {
          ticks: { color: "#8a91a0" },
          grid: { color: "rgba(255,255,255,0.05)" },
          title: { display: true, text: "feet", color: "#8a91a0" },
        },
      },
    },
  });
}

function renderHiLoStats(container, hilo) {
  const now = new Date();
  const upcoming = hilo
    .map((p) => ({ ...p, date: new Date(p.t.replace(" ", "T")) }))
    .filter((p) => p.date >= now)
    .slice(0, 4);

  if (!upcoming.length) {
    container.innerHTML = `<p class="tide-status">No upcoming high/low data returned.</p>`;
    return;
  }

  container.innerHTML = upcoming
    .map((p) => {
      const isHigh = p.type === "H";
      return `
        <div class="tide-stat">
          <div class="label">${isHigh ? "Next High" : "Next Low"} Tide</div>
          <div class="value ${isHigh ? "high" : "low"}">${parseFloat(p.v).toFixed(2)} ft</div>
          <div class="tide-status">${formatTime(p.t)} · ${p.date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</div>
        </div>`;
    })
    .join("");
}

async function initTideWidget() {
  const canvas = document.getElementById("tide-chart");
  const statsEl = document.getElementById("tide-stats");
  const statusEl = document.getElementById("tide-fetch-status");
  if (!canvas) return;

  try {
    const { curve, hilo } = await fetchTideData();
    if (!curve.length) throw new Error("No tide curve data returned");
    renderTideChart(canvas, curve);
    if (statsEl) renderHiLoStats(statsEl, hilo);
    if (statusEl) {
      statusEl.textContent = `Live NOAA data · Station 8723214, Virginia Key, Biscayne Bay · updated ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    }
  } catch (err) {
    console.error("Tide widget error:", err);
    if (statusEl) {
      statusEl.textContent =
        "Couldn't load live tide data right now. View directly on NOAA: tidesandcurrents.noaa.gov/noaatidepredictions.html?id=8723214";
    }
    if (statsEl) {
      statsEl.innerHTML = `<p class="tide-status">Live tide feed unavailable at the moment — please refresh, or check the NOAA station directly.</p>`;
    }
  }
}

document.addEventListener("DOMContentLoaded", initTideWidget);
