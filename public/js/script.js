const projects = [
  {
    name: "ztask",
    source: "https://github.com/lepton9/ztask",
    description: "A task runner for automating workflows.",
    tags: ["Zig", "CLI", "TUI", "Linux", "Windows"],
  },
  {
    name: "asconv",
    source: "https://github.com/lepton9/asconv",
    link: "https://asconv.thelepton.com",
    description: "A tool to convert images or videos to ASCII.",
    tags: ["Zig", "CLI"],
  },
  {
    name: "vbdist",
    source: "https://github.com/lepton9/vbdist",
    description:
      "A tool for creating teams of equal size by evaluating player attributes.",
    tags: ["C", "TUI"],
  },
  {
    name: "zcli",
    source: "https://github.com/lepton9/zcli",
    description: "CLI argument parser library in Zig.",
    tags: ["Zig"],
  },
  {
    name: "lim",
    source: "https://github.com/lepton9/lim",
    description: "A terminal text editor. Inspired by Vim.",
    tags: ["C++"],
  },
];

const DEFAULT_CHAR_SPEED_MS = 2;

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

const pageScrollEl = document.getElementById("page-scroll");
const modeTextEl = document.getElementById("mode");

const cursor = createCursor();

let typewriteObserver = null;
let typewriteChain = Promise.resolve();

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// const modes = ["normal", "insert", "command"];
// let mode = "normal";

function normalMode(cursorEl) {
  modeTextEl.textContent = "NORMAL";
  modeTextEl.classList = null;
  modeTextEl.classList.add("mode-normal");

  cursorEl.classList.remove("active");
  cursorEl.classList.add("blink");
}

function insertMode(cursorEl) {
  modeTextEl.textContent = "INSERT";
  modeTextEl.classList = null;
  modeTextEl.classList.add("mode-insert");

  cursorEl.classList.add("active");
  cursorEl.classList.remove("blink");
}

/* Create a cursor element. */
function createCursor() {
  const el = document.createElement("span");
  el.id = "cursor";
  el.className = "cursor";
  el.textContent = "_";
  return el;
}

/* Move the cursor to the given text node. */
function moveCursorToTextNode(textNode, cursorEl) {
  if (!textNode || !cursorEl) return;
  const parent = textNode.parentNode;
  if (!parent) return;

  parent.insertBefore(cursorEl, textNode.nextSibling);
}

/* Return the text node to write to. */
function getTypewriteTextNode(el) {
  if (!el) return null;

  if (el.firstChild && el.firstChild.nodeType === Node.TEXT_NODE)
    return el.firstChild;

  const textNode = document.createTextNode("");
  el.insertBefore(textNode, el.firstChild);
  return textNode;
}

/* Collect all the elements that have the data-typewrite attribute. */
function collectTypewriteTargets() {
  const els = Array.from(document.querySelectorAll("[data-typewrite]"));
  return els
    .map((el) => {
      const textNode = getTypewriteTextNode(el);

      const trigger = (
        el.getAttribute("data-typewrite-trigger") ?? "view"
      ).toLowerCase();

      const preserveWhitespace = el.hasAttribute(
        "data-typewrite-preserve-whitespace"
      );

      const textAttr = el.getAttribute("data-typewrite-text");
      const rawText = (textAttr ?? textNode?.textContent ?? "").toString();

      const fullText = preserveWhitespace
        ? rawText
        : rawText.replace(/[\t\n\r ]+/g, " ").trim();

      const speedAttr = el.getAttribute("data-typewrite-speed");
      const delayAttr = el.getAttribute("data-typewrite-delay");

      const speed = Number.parseInt(
        speedAttr ?? `${DEFAULT_CHAR_SPEED_MS}`,
        10
      );
      const delay = Number.parseInt(delayAttr ?? "0", 10);

      return {
        el,
        textNode,
        trigger,
        fullText,
        speed: Number.isFinite(speed) ? speed : DEFAULT_CHAR_SPEED_MS,
        delay: Number.isFinite(delay) ? delay : 0,
      };
    })
    .filter((t) => t.textNode && t.fullText.length > 0);
}

function onScroll() {
  window.requestAnimationFrame(() => {
    updateActiveLink();
    updatePageScroll();
  });
}

function onResize() {
  updateActiveLink();
  updatePageScroll();
}

/* Update the page scroll indicator element. */
function updatePageScroll() {
  if (!pageScrollEl) return;

  const root = document.documentElement;
  const maxScroll = root.scrollHeight - root.clientHeight;
  const scrollTop = root.scrollTop;

  const pct =
    maxScroll <= 0
      ? 100
      : Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100)));

  pageScrollEl.textContent = `${pct}%`;
}

/* Update the active link in the header based on the scroll position */
function updateActiveLink() {
  const scrollY = window.scrollY + 100;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute("id");

    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    }
  });
}

/* Add typing animation to write the given text to the element */
async function typeText(fullText, textNode, ms_per_char, cursorEl, opts) {
  return new Promise((resolve) => {
    if (!textNode) {
      resolve();
      return;
    }

    textNode.textContent = "";

    if (cursorEl) {
      moveCursorToTextNode(textNode, cursorEl);
      insertMode(cursorEl);
    }

    let i = 0;

    function appendChar() {
      if (i >= fullText.length) {
        const keepCursor = Boolean(opts?.keepCursor);
        if (cursorEl && !keepCursor) normalMode(cursorEl);
        resolve();
        return;
      }
      textNode.textContent += fullText.charAt(i++);
      setTimeout(appendChar, ms_per_char);
    }

    setTimeout(appendChar, ms_per_char);
  });
}

/* Enqueues a function to be executed sequentially in the typewrite chain. */
function enqueueTypewrite(fn) {
  typewriteChain = typewriteChain.then(fn, fn);
  return typewriteChain;
}

function isTypewriteDone(el) {
  return el.hasAttribute("data-typewrite-done");
}

function markTypewriteDone(el) {
  el.setAttribute("data-typewrite-done", "1");
}

/*
 * Write all the targets sequentially.
 * Uses the given cursor or the global cursor if undefined.
 */
async function runTypewriteTargets(targets, writeCursor) {
  const todo = targets.filter((t) => t.el && !isTypewriteDone(t.el));
  if (todo.length === 0) return;

  let selectedCursor = writeCursor ?? cursor;

  insertMode(selectedCursor);

  for (const t of todo) {
    moveCursorToTextNode(t.textNode, selectedCursor);
    if (t.delay > 0) await sleep(t.delay);
    await typeText(t.fullText, t.textNode, t.speed, selectedCursor, {
      keepCursor: true,
    });
    markTypewriteDone(t.el);
  }

  normalMode(selectedCursor);
}

/* Observe all the target elements */
function setupTypewriteObserver(viewTargets) {
  if (typewriteObserver) typewriteObserver.disconnect();

  const byEl = new Map(viewTargets.map((t) => [t.el, t]));

  typewriteObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;

        const t = byEl.get(e.target);
        if (!t) continue;

        if (isTypewriteDone(t.el)) {
          typewriteObserver.unobserve(t.el);
          continue;
        }

        typewriteObserver.unobserve(t.el);
        enqueueTypewrite(() => runTypewriteTargets([t]));
      }
    },
    { threshold: 0.4 }
  );

  for (const t of viewTargets) {
    if (!isTypewriteDone(t.el)) typewriteObserver.observe(t.el);
  }
}

/* Collect and setup all the typewrite sections */
function initTypewrite() {
  const targets = collectTypewriteTargets();
  if (targets.length === 0) return;

  for (const t of targets) {
    if (!t.el.hasAttribute("data-typewrite-text")) {
      t.el.setAttribute("data-typewrite-text", t.fullText);
    }
    t.textNode.textContent = "";
  }

  const loadTargets = targets.filter((t) => t.trigger === "load");
  const viewTargets = targets.filter((t) => t.trigger !== "load");

  runTypewriteTargets(loadTargets, createCursor());

  setupTypewriteObserver(viewTargets);
}

/* Replay all the typewrite sections */
function replayTypewrite() {
  return enqueueTypewrite(async () => {
    const targets = collectTypewriteTargets();
    for (const t of targets) {
      t.el.removeAttribute("data-typewrite-done");
      t.textNode.textContent = "";
    }

    initTypewrite();
  });
}

/* Render all the defined projects. */
function renderProjects() {
  const list = document.querySelector(".projects-list");
  list.innerHTML = "";
  for (const p of projects) {
    const tags = p.tags.map((t) => `<li class="lang-tag">${t}</li>`).join("");
    list.innerHTML += `
      <article class="project-card">
        <div class="project-top">
          <h3 class="project-title">
            <span class="project-arrow">&gt;</span> 
            <a href="${p.link ?? p.source}" aria-label="Project" class="project-link">
              ${p.name}
            </a>
          </h3>
          <a href="${p.source}" aria-label="Source code" class="project-link">src</a>
        </div>
        <p class="project-description">${p.description}</p>
        <ul class="project-tech">${tags}</ul>
      </article>`;
  }
}

function init() {
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });

  initTypewrite();

  window.typewriteReplay = replayTypewrite;

  renderProjects();
  updateActiveLink();
  updatePageScroll();
}

init();
