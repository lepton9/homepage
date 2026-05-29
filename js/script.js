
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
    description: "A tool for creating teams of equal size by evaluating player attributes.",
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

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");


const header = document.querySelector(".header");
const heroName = document.querySelector(".hero-name");
const cursor = heroName.querySelector(".cursor");


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
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${id}`
        );
      });
    }
  });
}

function typeText(fullText, textNode, ms_per_char) {
  textNode.textContent = "";
  let i = 0;

  function appendChar() {
    if (i >= fullText.length) return;
    textNode.textContent += fullText.charAt(i++);
    setTimeout(appendChar, ms_per_char);
  }
  setTimeout(appendChar, ms_per_char);
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
    const fullText = heroName.childNodes[0].textContent;
    heroName.childNodes[0].textContent = "";
    setTimeout(typeText, 200, fullText, heroName.childNodes[0], 70);
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  renderProjects();
  updateActiveLink();
};

init();

