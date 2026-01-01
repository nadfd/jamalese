// --------------------
// State
// --------------------
let sourceLang = "auto";
let targetLang = "jamalese";
let detectedLang = null;

// --------------------
// Elements
// --------------------
const inputEl = document.getElementById("input");
const outputEl = document.getElementById("output");

const sourceBar = document.getElementById("source-lang");
const targetBar = document.getElementById("target-lang");
const swapBtn = document.getElementById("swap-btn");

// --------------------
// Helpers
// --------------------
function updateUnderline(bar) {
  const active = bar.querySelector(".lang.active");
  const underline = bar.querySelector(".underline");

  if (!active) return;

  const rect = active.getBoundingClientRect();
  const parentRect = bar.querySelector(".langs").getBoundingClientRect();

  underline.style.width = `${rect.width}px`;
  underline.style.transform = `translateX(${rect.left - parentRect.left}px)`;
}

function setActive(bar, button) {
  bar.querySelectorAll(".lang").forEach(b => b.classList.remove("active"));
  button.classList.add("active");
  updateUnderline(bar);
}

function detectLanguage(text) {
  if (!text.trim()) return null;
  return /^[a-zA-Z]/.test(text) ? "english" : "jamalese";
}

// --------------------
// Language Selection
// --------------------
function handleLangClick(e, isSource) {
  const btn = e.target.closest(".lang");
  if (!btn) return;

  const lang = btn.dataset.lang;

  if (isSource) {
    sourceLang = lang;
    setActive(sourceBar, btn);
  } else {
    // Prevent duplicates unless allowed by auto-detect
    if (lang === sourceLang && sourceLang !== "auto") return;

    if (
      sourceLang === "auto" &&
      detectedLang &&
      lang === detectedLang
    ) {
      // allowed
    }

    targetLang = lang;
    setActive(targetBar, btn);
  }

  translate();
}

// --------------------
// Auto language label logic
// --------------------
function updateAutoLabel() {
  const autoBtn = sourceBar.querySelector('[data-lang="auto"]');

  if (sourceLang !== "auto") {
    autoBtn.textContent = "Auto";
    return;
  }

  if (!detectedLang) {
    autoBtn.textContent = "Auto";
  } else {
    autoBtn.textContent = `${capitalize(detectedLang)} – Auto`;
  }

  updateUnderline(sourceBar);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// --------------------
// Translation (stub)
// --------------------
function translate() {
  const text = inputEl.value;

  if (!text.trim()) {
    detectedLang = null;
    outputEl.textContent = "";
    updateAutoLabel();
    return;
  }

  if (sourceLang === "auto") {
    detectedLang = detectLanguage(text);
    updateAutoLabel();
  }

  // placeholder translation
  outputEl.textContent = `[${sourceLang} → ${targetLang}] ${text}`;
}

// --------------------
// Events
// --------------------
sourceBar.addEventListener("click", e => handleLangClick(e, true));
targetBar.addEventListener("click", e => handleLangClick(e, false));

swapBtn.addEventListener("click", () => {
  if (sourceLang === "auto") return;

  [sourceLang, targetLang] = [targetLang, sourceLang];

  const sBtn = sourceBar.querySelector(`[data-lang="${sourceLang}"]`);
  const tBtn = targetBar.querySelector(`[data-lang="${targetLang}"]`);

  if (sBtn) setActive(sourceBar, sBtn);
  if (tBtn) setActive(targetBar, tBtn);

  translate();
});

inputEl.addEventListener("input", translate);

// --------------------
// Init
// --------------------
updateUnderline(sourceBar);
updateUnderline(targetBar);
