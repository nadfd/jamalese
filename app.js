/* =========================
   DICTIONARY SETUP
========================= */

// dictionary is loaded from words.js
const jamToEng = {};
const engToJam = {};

for (const [jam, engRaw] of dictionary) {
  const meanings = engRaw
    .split(",")
    .map(p => p.replace(/\(.*?\)/g, "").trim().toLowerCase())
    .filter(Boolean);

  jamToEng[jam] = [...new Set(meanings)];

  meanings.forEach(m => {
    if (!engToJam[m]) engToJam[m] = [];
    if (!engToJam[m].includes(jam)) engToJam[m].push(jam);
  });
}

/* =========================
   ELEMENTS
========================= */

const input = document.getElementById("input");
const output = document.getElementById("result");

const leftSelect = document.getElementById("leftLang");
const rightSelect = document.getElementById("rightLang");

const leftUnderline = document.getElementById("leftUnderline");
const rightUnderline = document.getElementById("rightUnderline");

/* =========================
   UTILITIES
========================= */

function tokenize(text) {
  return text.toLowerCase().trim().split(/\s+/);
}

function detectLanguage(words) {
  let jam = 0, eng = 0;
  words.forEach(w => {
    if (jamToEng[w]) jam++;
    if (engToJam[w]) eng++;
  });
  return jam >= eng ? "jam" : "eng";
}

function translateWithPhrases(words, dict) {
  const result = [];
  const keys = Object.keys(dict);
  const maxLen = Math.max(1, ...keys.map(k => k.split(" ").length));

  let i = 0;
  while (i < words.length) {
    let matched = false;

    for (let size = Math.min(maxLen, words.length - i); size > 0; size--) {
      const chunk = words.slice(i, i + size).join(" ");
      if (dict[chunk]) {
        let val = dict[chunk];
        if (Array.isArray(val)) val = val[0];
        result.push(val);
        i += size;
        matched = true;
        break;
      }
    }

    if (!matched) {
      result.push(words[i]);
      i++;
    }
  }

  return result.join(" ");
}

/* =========================
   UNDERLINE HANDLING
========================= */

function updateUnderline(select, underline) {
  const option = select.options[select.selectedIndex];
  underline.style.width = option.offsetWidth + "px";
  underline.style.left = option.offsetLeft + "px";
}

function updateUnderlines() {
  updateUnderline(leftSelect, leftUnderline);
  updateUnderline(rightSelect, rightUnderline);
}

/* =========================
   AUTO LABEL HANDLING
========================= */

function updateAutoLabel(detected) {
  const autoOption = [...leftSelect.options].find(o => o.value === "auto");
  if (!autoOption) return;

  if (!input.value.trim()) {
    autoOption.textContent = "Auto";
  } else {
    autoOption.textContent =
      detected === "jam" ? "Zamœlis – Auto" : "English – Auto";
  }
}

/* =========================
   TRANSLATION CORE
========================= */

function translate() {
  const text = input.value.trim();
  if (!text) {
    output.textContent = "";
    updateAutoLabel(null);
    updateUnderlines();
    return;
  }

  const words = tokenize(text);
  let from = leftSelect.value;
  let to = rightSelect.value;

  if (from === "auto") {
    const detected = detectLanguage(words);
    updateAutoLabel(detected);

    if (detected === "jam") {
      output.textContent = translateWithPhrases(words, jamToEng);
    } else {
      output.textContent = translateWithPhrases(words, engToJam);
    }
  } else {
    updateAutoLabel(null);

    const dict =
      from === "jam" && to === "eng" ? jamToEng :
      from === "eng" && to === "jam" ? engToJam :
      null;

    output.textContent = dict
      ? translateWithPhrases(words, dict)
      : words.join(" ");
  }

  updateUnderlines();
}

/* =========================
   LANGUAGE CONFLICT FIX
========================= */

function preventDuplicateSelection(changed, other) {
  if (changed.value !== "auto" && changed.value === other.value) {
    other.value = changed.value === "jam" ? "eng" : "jam";
  }
}

/* =========================
   EVENTS
========================= */

input.addEventListener("input", translate);

leftSelect.addEventListener("change", () => {
  preventDuplicateSelection(leftSelect, rightSelect);
  translate();
});

rightSelect.addEventListener("change", () => {
  preventDuplicateSelection(rightSelect, leftSelect);
  translate();
});

window.addEventListener("resize", updateUnderlines);
window.addEventListener("load", updateUnderlines);
