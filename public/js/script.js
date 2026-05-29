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

const DEFAULT_CHAR_SPEED_MS = 70;

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

const heroName = document.querySelector(".hero-name");

const cursor = createCursor();

// const modes = ["normal", "insert", "command"];
// let mode = "normal";

function normalMode(cursorEl) {
  // mode = "normal";
  cursorEl.classList.remove("active");
  cursorEl.classList.add("blink");
}

function insertMode(cursorEl) {
  // mode = "insert";
  cursorEl.classList.add("active");
  cursorEl.classList.remove("blink");
}

function createCursor() {
  const el = document.createElement("span");
  el.id = "cursor";
  el.className = "cursor";
  el.textContent = "_";
  return el;
}

function moveCursorToTextNode(textNode, cursorEl) {
  if (!textNode || !cursorEl) return;
  const parent = textNode.parentNode;
  if (!parent) return;

  parent.insertBefore(cursorEl, textNode.nextSibling);
}

function onScroll() {
  window.requestAnimationFrame(() => {
    updateActiveLink();
  });
}

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

async function typeText(fullText, textNode, ms_per_char, cursorEl) {
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
        if (cursorEl) {
          normalMode(cursorEl);
        }
        resolve();
        return;
      }
      textNode.textContent += fullText.charAt(i++);
      setTimeout(appendChar, ms_per_char);
    }

    setTimeout(appendChar, ms_per_char);
  });
}

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
  if (heroName) {
    const textNode = heroName.childNodes[0];
    const fullText = textNode?.textContent ?? "";

    if (textNode) {
      textNode.textContent = "";
      setTimeout(() => {
        typeText(fullText, textNode, DEFAULT_CHAR_SPEED_MS, cursor);
      }, 200);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  renderProjects();
  updateActiveLink();
}

init();
