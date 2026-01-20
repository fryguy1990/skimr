window.addEventListener("DOMContentLoaded", () => {

/**********************
 * Simple "routing"
 **********************/
function setupRouting() {
  const pageLanding = document.getElementById("page-landing");
  const pageApp = document.getElementById("page-app");
  const pageLibrary = document.getElementById("page-library");

  if (!pageLanding || !pageApp || !pageLibrary) {
    console.error("Routing error: missing one of page containers", {
      pageLanding,
      pageApp,
      pageLibrary,
    });
    return;
  }

  function renderRoute() {
    const hash = window.location.hash || "#/";
    const isApp = hash.startsWith("#/app");
    const isLibrary = hash.startsWith("#/library");

    pageLanding.classList.toggle("hidden", isApp || isLibrary);
    pageApp.classList.toggle("hidden", !isApp);
    pageLibrary.classList.toggle("hidden", !isLibrary);

    // Entering app: make sure reader is ready
    if (isApp) {
      setTimeout(() => {
        document.body.focus?.();

        if (!state.words || !state.words.length) {
          loadSample("psychology");
        }

        updateUI();
        flashWord(state.index, true);
      }, 0);
    } else {
      if (state.isPlaying) togglePlay(false);
    }
  }

  window.addEventListener("hashchange", renderRoute);
  renderRoute(); // run once on load
}

/**********************
 * Landing button
 **********************/
function setupLandingButton() {
  const landingTryBtn = document.getElementById("landingTryBtn");
  if (landingTryBtn) {
    landingTryBtn.addEventListener("click", () => {
      window.location.hash = "#/app";
    });
  }
}



    /**********************
     * Dummy preloaded texts
     **********************/
    // NOTE: These are "excerpt-style" dummy texts inspired by the requested categories.
    // They are original demo copy (no API calls).
    const SAMPLES = {
      psychology: {
        title: "The Psychology of Money (Demo Excerpt)",
        targetWords: 500,
        text:
`Money is rarely just math. It’s emotion, memory, and story. Two people can earn the same salary, live in the same city, and still feel like they’re playing completely different games. One feels safe. The other feels behind. That gap usually isn’t a spreadsheet problem—it’s a narrative problem.

Here’s the twist: we don’t experience money in dollars. We experience it in outcomes. In how quickly the rent gets paid, in whether the car starts, in what happens when the unexpected shows up on a Tuesday. Every purchase whispers a promise: relief, status, freedom, control, comfort, belonging. The tricky part is that those promises aren’t universal. They’re personal, shaped by what you’ve lived through.

A person who grew up during instability can become obsessed with certainty. Another who watched a parent miss every moment chasing overtime might value time more than anything. Neither is wrong. But both will make decisions that look irrational to someone who carries a different history.

This is why “good advice” often fails. Advice tends to assume we all want the same thing: maximize wealth. But most people want to maximize peace. They want a life that feels calm, predictable, and meaningful. Wealth can help, but only if it supports the life you actually want.

The most powerful financial skill isn’t picking the perfect investment. It’s building a system you can stick with when the world gets loud. A plan you can follow when the market drops, when friends brag, when headlines scream, and when your own doubts start negotiating.

Start small. Automate the basics. Create a buffer that protects you from panic. Then choose a strategy you understand well enough to hold through boredom and chaos. Boring is underrated. Boring means you’re not improvising your future.

The goal isn’t to be the smartest person in the room. It’s to be the most consistent. In the long run, consistency looks like genius. It’s the quiet advantage: spend less than you make, avoid debt that steals your choices, invest steadily, and give time a chance to do its work.

And remember: money is a tool, not a scoreboard. If it buys you freedom but costs you your health, your relationships, or your sense of self, it’s not a win. The best financial plan is the one that lets you sleep at night—and still builds a tomorrow you’re excited to wake up for.`
      },

      tech: {
        title: "Tech News (Demo Article)",
        targetWords: 400,
        text:
`This morning’s biggest tech story isn’t a single product launch—it’s a shift in how software gets built. Teams are moving from “feature factories” to systems that continuously learn, measure, and adapt. In plain terms: shipping faster is no longer enough. Companies want to ship smarter.

The change is being driven by three forces. First, costs. Cloud bills climbed quietly for years, and now finance teams are asking tougher questions. Second, user expectations. People won’t tolerate slow, cluttered apps when alternatives are a click away. Third, AI tooling. Even lightweight automation can remove the tedious parts of building, testing, and documenting.

What does this look like in practice? Smaller releases, more often. Product teams treat every feature like an experiment: define success, ship a minimal version, measure outcomes, and iterate quickly. The best teams aren’t guessing what users want—they’re watching what users do.

There’s also a renewed focus on “performance as a feature.” A fast app feels trustworthy. A slow app feels broken, even if it technically works. So companies are investing in better telemetry, smaller bundles, and smarter caching. This isn’t glamorous work, but it pays off.

Security is evolving too. Instead of a once-a-year audit, modern teams bake security checks into the pipeline. Automated scanning, dependency tracking, and permission reviews happen on every change. It’s not perfect, but it’s better than waiting for a breach to teach the lesson.

Finally, there’s a cultural shift: fewer meetings, more written decisions. Remote and hybrid work pushed teams to document tradeoffs, not just outcomes. The side effect is clarity. When a decision is written down, it can be challenged, improved, and reused.

If the trend continues, the winners won’t be the companies with the flashiest demos. They’ll be the ones who build calm systems that keep improving, week after week. That’s how software starts to feel less like chaos and more like craft.`
      },

      classic: {
        title: "Classic Literature (Demo Passage)",
        targetWords: 300,
        text:
`It was near the end of the afternoon when the traveler reached the edge of the town. The light fell softly upon the windows, and the streets seemed to hold their breath, as though some small secret had been spoken and everyone waited for its meaning to settle.

He walked without haste, listening to the distant sounds of doors closing and voices fading into supper. A cat watched him from a stoop, unmoved by his presence, and a faint wind turned the corner with the patience of an old acquaintance.

In the square, a fountain murmured to itself. The water rose and fell in a steady rhythm, as if keeping time for thoughts that dared not be hurried. The traveler paused there, not from weariness, but from a sudden sense that the day had been arranged for him—every ordinary thing placed carefully, so that he might notice it at last.

He remembered, then, how easily the mind outruns the world. It leaps ahead, inventing troubles and triumphs, while the present moment waits—plain, exact, and quietly generous. He looked again at the buildings, the pale sky, the narrow path leading onward, and felt a calmness that surprised him.

For a time, he did nothing but stand. And in that stillness, the town seemed less like a destination and more like a question, asked kindly, and without demanding an answer.`
      }
    };

function buildDefaultDocsFromSamples() {
  return [
    { id: "psychology", title: SAMPLES.psychology.title, sampleKey: "psychology" },
    { id: "tech", title: SAMPLES.tech.title, sampleKey: "tech" },
    { id: "classic", title: SAMPLES.classic.title, sampleKey: "classic" },
  ].map(d => ({
    ...d,
    position: 0,
    totalWords: 0,
    updatedAt: Date.now(),
  }));
}


    /**********************
     * Reader state
     **********************/
    const state = {
      words: [],
      index: 0,
      isPlaying: false,
      wpm: 300,
      timerId: null,
      activeSampleKey: "psychology",
      lastWordRendered: "",
    };

    let docs = [];
let currentDocId = "psychology";

const STORAGE_KEY = "skimr_docs_v1";

function saveDocs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

function loadDocs() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}


    const wordEl = document.getElementById("wordEl");
    const statusEl = document.getElementById("statusEl");
    const progressFill = document.getElementById("progressFill");
    const progressMeta = document.getElementById("progressMeta");

    const wpmSlider = document.getElementById("wpmSlider");
    const wpmVal = document.getElementById("wpmVal");

    const statWpm = document.getElementById("statWpm");
    const statWords = document.getElementById("statWords");
    const statTime = document.getElementById("statTime");
    const statMode = document.getElementById("statMode");

    const playBtn = document.getElementById("playBtn");
    const backBtn = document.getElementById("backBtn");
    const fwdBtn = document.getElementById("fwdBtn");
    const restartBtn = document.getElementById("restartBtn");

    const sampleSelect = document.getElementById("sampleSelect");
    const textArea = document.getElementById("textArea");
    const useTextBtn = document.getElementById("useTextBtn");
    const resetSampleBtn = document.getElementById("resetSampleBtn");

    const toast = document.getElementById("toast");

    function showToast(msg){
      toast.textContent = msg;
      toast.classList.add("show");
      clearTimeout(showToast._t);
      showToast._t = setTimeout(() => toast.classList.remove("show"), 1200);
    }

    /**********************
     * Text parsing utilities
     **********************/
    function normalizeText(raw){
      // Keep paragraph boundaries as special markers
      // Convert Windows newlines and trim
      return (raw || "")
        .replace(/\r\n/g, "\n")
        .replace(/\t/g, " ")
        .replace(/[ ]{2,}/g, " ")
        .trim();
    }

    function tokenizeWithParagraphs(raw){
      const text = normalizeText(raw);
      if (!text) return [];

      // Split into paragraphs on blank lines
      const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

      const tokens = [];
      for (let pi=0; pi<paragraphs.length; pi++){
        const p = paragraphs[pi];

        // Split words, keeping punctuation attached to words (for timing)
        const words = p
          .replace(/\n/g, " ")
          .split(" ")
          .map(w => w.trim())
          .filter(Boolean);

        for (const w of words) tokens.push(w);

        // Add a paragraph break marker except after last paragraph
        if (pi !== paragraphs.length - 1) tokens.push("¶"); // special marker
      }
      return tokens;
    }

    /**********************
     * ORP highlighting
     **********************/
    function orpIndexForWord(word){
      // Choose a slightly-left-of-center ORP based on length (common RSVP heuristic)
      const clean = word.replace(/[^\p{L}\p{N}']/gu, ""); // remove punctuation for ORP placement
      const len = clean.length || word.length;

      if (len <= 1) return 0;
      if (len <= 5) return 1;
      if (len <= 9) return 2;
      if (len <= 13) return 3;
      return 4;
    }

    function renderWordWithORP(word){
      if (word === "¶") {
        return `<span style="color: rgba(255,255,255,.85);">—</span>`;
      }

      // Keep original word visually (including punctuation) but compute ORP on cleaned word.
      const clean = word.replace(/[^\p{L}\p{N}']/gu, "");
      if (!clean) return escapeHtml(word);

      const idx = orpIndexForWord(word);

      // Map ORP index onto the cleaned word position.
      // If word has punctuation at start, we still highlight within the main letters.
      const safeIdx = Math.min(idx, clean.length - 1);

      // Find the position of the ORP character in the original string by scanning letters.
      let letterCount = -1;
      let orpPos = 0;
      for (let i=0; i<word.length; i++){
        const ch = word[i];
        if (/\p{L}|\p{N}|'/u.test(ch)) {
          letterCount++;
          if (letterCount === safeIdx) { orpPos = i; break; }
        }
      }

      const before = escapeHtml(word.slice(0, orpPos));
      const orpChar = escapeHtml(word.slice(orpPos, orpPos+1));
      const after = escapeHtml(word.slice(orpPos+1));
      return `${before}<span class="orp">${orpChar}</span>${after}`;
    }

    function escapeHtml(str){
      return (str || "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
    }

    /**********************
     * Smart timing
     **********************/
    function computeDelayMs(word, wpm){
      // Base duration per word
      const base = 60000 / Math.max(1, wpm);

      if (word === "¶") return base * 2.0; // paragraph break pause

      // punctuation multipliers
      // period/exclamation/question/end quotes: 1.5x
      // comma/semicolon/colon: 1.2x
      const endsSentence = /[.!?]["')\]]*$/.test(word);
      const hasCommaish = /[,;:]["')\]]*$/.test(word);

      let mult = 1.0;
      if (endsSentence) mult *= 1.5;
      else if (hasCommaish) mult *= 1.2;

      // longer words pause
      const clean = word.replace(/[^\p{L}\p{N}']/gu, "");
      if (clean.length > 8) mult *= 1.3;

      return base * mult;
    }

    /**********************
     * Core playback
     **********************/
    function clearTimer(){
      if (state.timerId) {
        clearTimeout(state.timerId);
        state.timerId = null;
      }
    }

    function flashWord(i, instant=false){
      const w = state.words[i] ?? "";
      state.lastWordRendered = w;

      // fade transition
      if (!instant) wordEl.classList.remove("show");
      // small delay to allow transition reset
      const render = () => {
        wordEl.innerHTML = renderWordWithORP(w || "Ready");
        requestAnimationFrame(() => wordEl.classList.add("show"));
      };

      if (instant) {
        wordEl.classList.add("show");
        render();
      } else {
        setTimeout(render, 40);
      }
    }

    function step(){
      if (!state.isPlaying) return;

      if (state.index >= state.words.length) {
        togglePlay(false);
        showToast("Done!");
        return;
      }

      flashWord(state.index);
      updateUI();

      const delay = computeDelayMs(state.words[state.index], state.wpm);
      state.index++;

      state.timerId = setTimeout(step, delay);
    }

    function togglePlay(force){
      const next = (typeof force === "boolean") ? force : !state.isPlaying;
      state.isPlaying = next;

      if (state.isPlaying) {
        statusEl.textContent = "Playing";
        playBtn.textContent = "❚❚";
        clearTimer();
        // If we were at end, restart
        if (state.index >= state.words.length) state.index = 0;
        step();
      } else {
        statusEl.textContent = "Paused";
        playBtn.textContent = "▶︎";
        clearTimer();

        saveProgressToDoc();
        renderLibrary();

      }
      updateUI();
    }

    function skip(delta){
      const next = Math.max(0, Math.min(state.words.length, state.index + delta));
      state.index = next;
      // When skipping, show the current word (state.index)
      const showAt = Math.min(state.index, Math.max(0, state.words.length - 1));
      flashWord(showAt, true);
      updateUI();
    }

    function restart(){
      state.index = 0;
      flashWord(0, true);
      updateUI();
      showToast("Restarted");
    }

    /**********************
     * UI updates
     **********************/
    function updateProgress(){
      const total = state.words.length || 0;
      const read = Math.min(state.index, total);
      const pct = total ? (read / total) * 100 : 0;
      progressFill.style.width = pct.toFixed(2) + "%";
      progressMeta.textContent = `${read} / ${total}`;
    }

    function estimateRemainingSeconds(){
      // Rough estimate from remaining words at base WPM,
      // plus smart timing multipliers for punctuation/long words/paragraphs.
      const total = state.words.length;
      const start = Math.min(state.index, total);
      if (!total || start >= total) return 0;

      let ms = 0;
      for (let i=start; i<total; i++){
        ms += computeDelayMs(state.words[i], state.wpm);
      }
      return Math.round(ms / 1000);
    }

    function formatTime(seconds){
      const s = Math.max(0, seconds|0);
      const m = Math.floor(s / 60);
      const r = s % 60;
      return `${m}:${String(r).padStart(2,"0")}`;
    }

    function updatePresetActive(){
      const pills = document.querySelectorAll(".pill[data-wpm]");
      pills.forEach(p => {
        const w = Number(p.getAttribute("data-wpm"));
        p.classList.toggle("active", w === state.wpm);
      });
    }

    function updateUI(){
      wpmVal.textContent = String(state.wpm);
      statWpm.textContent = String(state.wpm);

      updateProgress();

      const total = state.words.length || 0;
      const read = Math.min(state.index, total);
      statWords.textContent = `${read} / ${total}`;

      const remaining = estimateRemainingSeconds();
      statTime.textContent = formatTime(remaining);

      updatePresetActive();
    }

function saveProgressToDoc() {
  const doc = docs.find(d => d.id === currentDocId);
  if (!doc) return;

  doc.position = state.index;
  doc.totalWords = state.words.length;
  doc.updatedAt = Date.now();

  saveDocs();
}


function renderLibrary() {
  const el = document.getElementById("libraryList");
  if (!el) return;

  if (!docs.length) {
    el.innerHTML = `<div class="footer-note">No documents yet.</div>`;
    return;
  }

  el.innerHTML = docs.map(doc => {
    const total = doc.totalWords || 0;
    const pct = total ? Math.round((doc.position / total) * 100) : 0;

    return `
      <div class="stat" style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;">
          <div>
            <div style="font-weight:700">${doc.title}</div>
            <div style="color:rgba(255,255,255,.65);font-size:12px;">${pct}% complete</div>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn" data-open="${doc.id}">Open</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}


    /**********************
     * Loading samples / user text
     **********************/
    function loadSample(key){
      const sample = SAMPLES[key];
      if (!sample) return;

      state.activeSampleKey = key;
      const tokens = tokenizeWithParagraphs(sample.text);
      state.words = tokens;
      state.index = 0;

      // Pre-fill textarea with chosen sample (so user sees/editable)
      textArea.value = sample.text.trim();
      sampleSelect.value = key;

      flashWord(0, true);
      updateUI();

      showToast(`Loaded: ${sample.title}`);
    }

function buildDefaultDocsFromSamples() {
  return [
    { id: "psychology", title: SAMPLES.psychology.title, sampleKey: "psychology" },
    { id: "tech", title: SAMPLES.tech.title, sampleKey: "tech" },
    { id: "classic", title: SAMPLES.classic.title, sampleKey: "classic" },
  ].map(d => ({
    ...d,
    position: 0,
    totalWords: 0,
    updatedAt: Date.now(),
  }));
}


    function loadFromTextarea(){
      const raw = textArea.value || "";
      const tokens = tokenizeWithParagraphs(raw);
      if (!tokens.length) {
        showToast("Paste some text first");
        return;
      }
      // Pause playback before swapping text
      togglePlay(false);

      state.words = tokens;
      state.index = 0;

      flashWord(0, true);
      updateUI();

      showToast("Text loaded");
    }

function extractTextFromHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  // Remove noisy elements
  doc.querySelectorAll("script, style, nav, footer, header, aside, noscript").forEach(el => el.remove());

  // Prefer <article> if present, else fall back to body
  const root = doc.querySelector("article") || doc.body;
  const text = (root?.innerText || "").trim();

  // Normalize spacing
  return text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}


    /**********************
     * Event bindings
     **********************/
    wpmSlider.addEventListener("input", (e) => {
      state.wpm = Number(e.target.value);
      updateUI();
      // If playing, timing adjusts automatically on next tick
    });

    document.getElementById("presetRow").addEventListener("click", (e) => {
      const pill = e.target.closest(".pill[data-wpm]");
      if (!pill) return;
      state.wpm = Number(pill.getAttribute("data-wpm"));
      wpmSlider.value = String(state.wpm);
      updateUI();
      showToast(`WPM: ${state.wpm}`);
    });

    playBtn.addEventListener("click", () => togglePlay());
    backBtn.addEventListener("click", () => { togglePlay(false); skip(-10); showToast("Back 10"); });
    fwdBtn.addEventListener("click", () => { togglePlay(false); skip(10); showToast("Forward 10"); });
    restartBtn.addEventListener("click", () => { togglePlay(false); restart(); });

    sampleSelect.addEventListener("change", (e) => {
      togglePlay(false);
      loadSample(e.target.value);
    });

    useTextBtn.addEventListener("click", loadFromTextarea);
    resetSampleBtn.addEventListener("click", () => {
      togglePlay(false);
      loadSample(sampleSelect.value);
    });

    // Keyboard shortcuts: Space = play/pause, arrows = skip, R = restart
    window.addEventListener("keydown", (e) => {
      // Don't hijack typing inside textarea/select
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      const isTyping = (tag === "textarea" || tag === "input" || tag === "select");

      if (e.code === "Space" && !isTyping) {
        e.preventDefault();
        if (!location.hash.startsWith("#/app")) location.hash = "#/app";
        togglePlay();
        return;
      }

      if (!location.hash.startsWith("#/app")) return;

      if (!isTyping && e.key === "ArrowLeft") {
        e.preventDefault();
        togglePlay(false);
        skip(-10);
        showToast("Back 10");
      }
      if (!isTyping && e.key === "ArrowRight") {
        e.preventDefault();
        togglePlay(false);
        skip(10);
        showToast("Forward 10");
      }
      if (!isTyping && (e.key === "r" || e.key === "R")) {
        e.preventDefault();
        togglePlay(false);
        restart();
      }
      if (!isTyping && (e.key === "Escape")) {
        // quick pause
        togglePlay(false);
        showToast("Paused");
      }
    });

function renderLibrary() {
  const el = document.getElementById("libraryList");
  if (!el) return;

  if (!docs.length) {
    el.innerHTML = `<div class="footer-note">No documents yet.</div>`;
    return;
  }

  el.innerHTML = docs.map(doc => {
    const total = doc.totalWords || 0;
    const pct = total ? Math.round((doc.position / total) * 100) : 0;

    return `
      <div class="stat" style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;">
          <div>
            <div style="font-weight:700">${doc.title}</div>
            <div style="color:rgba(255,255,255,.65);font-size:12px;">${pct}% complete</div>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn" data-open="${doc.id}">Open</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

document.addEventListener("click", (e) => {
  const openId = e.target.closest("[data-open]")?.getAttribute("data-open");
  if (!openId) return;

  currentDocId = openId;

  saveDocs();

  const doc = docs.find(d => d.id === openId);
  if (!doc) return;

  if (doc.sampleKey) {
  loadSample(doc.sampleKey);
} else {
  const text = doc.rawText || "";
  const tokens = tokenizeWithParagraphs(text);

  togglePlay(false);
  state.words = tokens;
  state.index = doc.position || 0;

  textArea.value = text;

  updateUI();
  flashWord(Math.min(state.index, state.words.length - 1), true);
}

  location.hash = "#/app";
});

const createDocBtn = document.getElementById("createDocBtn");
if (createDocBtn) {
  createDocBtn.addEventListener("click", () => {
    const title = document.getElementById("newDocTitle")?.value?.trim() || "Untitled";
    const text = document.getElementById("newDocText")?.value?.trim() || "";

    if (!text) {
      showToast("Paste some text first");
      return;
    }

    const id = "doc_" + Math.random().toString(16).slice(2);
    const tokens = tokenizeWithParagraphs(text);

    const newDoc = {
      id,
      title,
      sourceType: "paste",
      rawText: text,
      position: 0,
      totalWords: tokens.length,
      updatedAt: Date.now(),
    };

    docs.unshift(newDoc);
    currentDocId = id;

    saveDocs();
    renderLibrary();

    // Load into reader immediately
    togglePlay(false);
    state.words = tokens;
    state.index = 0;
    textArea.value = text;
    updateUI();
    flashWord(0, true);

    showToast("Document created");
    location.hash = "#/app";
  });
}

const importUrlBtn = document.getElementById("importUrlBtn");
if (importUrlBtn) {
  importUrlBtn.addEventListener("click", async () => {
    const url = document.getElementById("importUrl")?.value?.trim() || "";
    if (!url) {
      showToast("Paste a URL first");
      return;
    }

    togglePlay(false);
    showToast("Importing...");

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const html = await res.text();
      const text = extractTextFromHtml(html);

      if (!text || text.length < 200) {
        throw new Error("Could not extract readable text (site may be blocked).");
      }

      // Create a new doc from imported text
      const id = "url_" + Math.random().toString(16).slice(2);
      const tokens = tokenizeWithParagraphs(text);

      const newDoc = {
        id,
        title: `Imported: ${new URL(url).hostname}`,
        sourceType: "url",
        sourceUrl: url,
        rawText: text,
        position: 0,
        totalWords: tokens.length,
        updatedAt: Date.now(),
      };

      docs.unshift(newDoc);
      currentDocId = id;

      saveDocs();
      renderLibrary();

      // Load into reader immediately
      state.words = tokens;
      state.index = 0;
      textArea.value = text;
      updateUI();
      flashWord(0, true);

      showToast("Imported!");
      location.hash = "#/app";
    } catch (err) {
      console.error(err);
      showToast("Import failed (blocked site). We'll add a proxy next.");
    }
  });
}



    /**********************
     * Initialize
     **********************/
    // Ensure a default sample is loaded for first-time use
  if (!state.words || !state.words.length) {
    loadSample("psychology");
  }

const loaded = loadDocs();
docs = (loaded && Array.isArray(loaded)) ? loaded : buildDefaultDocsFromSamples();

// Recompute totalWords for sample-based docs (safe + ensures totals are correct)
docs.forEach(d => {
  if (d.sampleKey && SAMPLES[d.sampleKey]) {
    const tokens = tokenizeWithParagraphs(SAMPLES[d.sampleKey].text);
    d.totalWords = tokens.length;
  }
});

saveDocs();     // ensures first-time users get docs saved
renderLibrary();


  setupRouting();
  setupLandingButton();
});
