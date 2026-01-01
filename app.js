/* ---------- Dark Mode ---------- */
const toggle = document.getElementById("darkToggle");
const root = document.documentElement;

const saved = localStorage.getItem("theme") || "dark";
root.dataset.theme = saved;
toggle.checked = saved === "dark";

toggle.addEventListener("change", () => {
  root.dataset.theme = toggle.checked ? "dark" : "light";
  localStorage.setItem("theme", root.dataset.theme);
});

/* ---------- Dictionary build (auto-updating) ---------- */
const engToJam = {};
const jamToEng = {};

for (const [jam, engRaw] of dictionary) {
  const parts = engRaw.split(",");
  const clean = parts.map(p =>
    p.replace(/\s*\(.*?\)/g, "").trim().toLowerCase()
  ).filter(Boolean);

  jamToEng[jam] = [...new Set(clean)];

  clean.forEach(e => {
    if (!engToJam[e]) engToJam[e] = [];
    if (!engToJam[e].includes(jam)) engToJam[e].push(jam);
  });
}

/* ---------- Translate ---------- */
const input = document.getElementById("input");
const result = document.getElementById("result");

function tokenize(t) {
  return t.toLowerCase().trim().split(/\s+/);
}

function detect(words) {
  let j = 0, e = 0;
  words.forEach(w => {
    if (jamToEng[w]) j++;
    if (engToJam[w]) e++;
  });
  return j >= e ? "jam" : "en";
}

function translate() {
  const text = input.value.trim();
  if (!text) {
    result.textContent = "";
    return;
  }

  const words = tokenize(text);
  const dir = detect(words);

  const out = words.map(w =>
    dir === "jam"
      ? jamToEng[w]?.[0] || w
      : engToJam[w]?.[0] || w
  );

  result.textContent = out.join(" ");
}

input.addEventListener("input", translate);

/* ---------- Copy ---------- */
const copyBtn = document.getElementById("copyBtn");

copyBtn.onclick = () => {
  if (!result.textContent) return;

  navigator.clipboard.writeText(result.textContent);
  copyBtn.textContent = "✓ Copied";
  copyBtn.disabled = true;

  setTimeout(() => {
    copyBtn.textContent = "📋";
    copyBtn.disabled = false;
  }, 1200);
};
