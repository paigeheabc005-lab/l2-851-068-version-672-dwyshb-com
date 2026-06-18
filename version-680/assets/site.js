const MovieSite = (() => {
  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  const setupNavigation = () => {
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  };

  const setupHero = () => {
    const slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll(".hero-dot"));
    const prev = slider.querySelector("[data-hero-prev]");
    const next = slider.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    };

    const restart = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", () => {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  };

  const setupQuickSearch = () => {
    document.querySelectorAll("[data-global-search]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = form.querySelector("input");
        const query = input ? input.value.trim() : "";
        const suffix = query ? `?q=${encodeURIComponent(query)}` : "";
        window.location.href = `./library.html${suffix}`;
      });
    });
  };

  const readQuery = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  };

  const setupFilters = () => {
    document.querySelectorAll("[data-filter-scope]").forEach((scope) => {
      const input = scope.querySelector("[data-filter-input]");
      const region = scope.querySelector("[data-filter-region]");
      const type = scope.querySelector("[data-filter-type]");
      const year = scope.querySelector("[data-filter-year]");
      const cards = Array.from(scope.querySelectorAll(".js-card"));
      const empty = scope.querySelector("[data-no-result]");
      const initial = readQuery();

      if (input && initial) {
        input.value = initial;
      }

      const apply = () => {
        const q = input ? input.value.trim().toLowerCase() : "";
        const r = region ? region.value : "";
        const t = type ? type.value : "";
        const y = year ? year.value : "";
        let visible = 0;

        cards.forEach((card) => {
          const text = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre
          ].join(" ").toLowerCase();

          const matched =
            (!q || text.includes(q)) &&
            (!r || card.dataset.region === r) &&
            (!t || card.dataset.type === t) &&
            (!y || card.dataset.year === y);

          card.classList.toggle("hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };

      [input, region, type, year].forEach((control) => {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  };

  const initMoviePlayer = (streamUrl) => {
    const video = document.getElementById("moviePlayer");
    const overlay = document.querySelector("[data-play-overlay]");
    if (!video || !streamUrl) {
      return;
    }

    let attached = false;

    const attach = () => {
      if (attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      attached = true;
    };

    const play = () => {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {});
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
  };

  ready(() => {
    setupNavigation();
    setupHero();
    setupQuickSearch();
    setupFilters();
  });

  return {
    initMoviePlayer
  };
})();
