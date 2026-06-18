import { H as Hls } from "./hls-vendor-dru42stk.js";

window.Hls = Hls;

const escapeHtml = (value) => String(value || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

function setupMobileMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (!toggle || !menu) {
    return;
  }
  toggle.addEventListener("click", () => {
    menu.classList.toggle("is-open");
  });
}

function setupSearch() {
  const inputs = Array.from(document.querySelectorAll("[data-site-search]"));
  const movies = window.MOVIE_SEARCH_DATA || [];
  inputs.forEach((input) => {
    const wrapper = input.closest(".search-wrap");
    const panel = wrapper ? wrapper.querySelector("[data-search-panel]") : null;
    if (!panel) {
      return;
    }

    const render = () => {
      const query = input.value.trim().toLowerCase();
      if (!query) {
        panel.classList.remove("is-open");
        panel.innerHTML = "";
        return;
      }
      const results = movies
        .filter((movie) => {
          const haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, (movie.tags || []).join(" ")]
            .join(" ")
            .toLowerCase();
          return haystack.includes(query);
        })
        .slice(0, 8);

      if (!results.length) {
        panel.innerHTML = '<div class="p-4 text-sm text-gray-500">没有找到匹配影片</div>';
        panel.classList.add("is-open");
        return;
      }

      panel.innerHTML = results.map((movie) => `
        <a class="search-result" href="${escapeHtml(movie.url)}">
          <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy" onerror="this.style.display='none'">
          <span>
            <strong class="block text-sm text-gray-900 line-clamp-1">${escapeHtml(movie.title)}</strong>
            <em class="block not-italic text-xs text-gray-500 line-clamp-1">${escapeHtml(movie.category)} · ${escapeHtml(movie.region)} · ${escapeHtml(movie.year)}</em>
          </span>
        </a>
      `).join("");
      panel.classList.add("is-open");
    };

    input.addEventListener("input", render);
    input.addEventListener("focus", render);
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-wrap")) {
      document.querySelectorAll("[data-search-panel]").forEach((panel) => panel.classList.remove("is-open"));
    }
  });
}

function setupPageFilters() {
  document.querySelectorAll("[data-filter-scope]").forEach((scope) => {
    const input = scope.querySelector("[data-filter-input]");
    const cards = Array.from(scope.querySelectorAll("[data-filter-card]"));
    const buttons = Array.from(scope.querySelectorAll("[data-filter-type]"));
    const empty = scope.querySelector("[data-filter-empty]");
    let activeType = "all";

    const apply = () => {
      const query = input ? input.value.trim().toLowerCase() : "";
      let visible = 0;
      cards.forEach((card) => {
        const text = (card.getAttribute("data-search") || "").toLowerCase();
        const type = card.getAttribute("data-type") || "";
        const passQuery = !query || text.includes(query);
        const passType = activeType === "all" || type === activeType;
        const show = passQuery && passType;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    if (input) {
      input.addEventListener("input", apply);
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        activeType = button.getAttribute("data-filter-type") || "all";
        buttons.forEach((item) => item.classList.toggle("is-active", item === button));
        apply();
      });
    });

    apply();
  });
}

function setupPlayers() {
  document.querySelectorAll("[data-player]").forEach((shell) => {
    const video = shell.querySelector("video");
    const overlay = shell.querySelector(".player-overlay");
    if (!video) {
      return;
    }
    const source = video.getAttribute("data-src");
    let hls = null;
    let attached = false;

    const attach = () => {
      if (attached || !source) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      }
      attached = true;
    };

    const play = () => {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    };

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", () => {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", () => {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", () => {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
}

ready(() => {
  setupMobileMenu();
  setupSearch();
  setupPageFilters();
  setupPlayers();
});
