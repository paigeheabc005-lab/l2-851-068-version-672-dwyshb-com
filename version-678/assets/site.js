(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    setupFilters();
    setupHero();
  });

  function textOf(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var panels = document.querySelectorAll("[data-filter-panel]");

    panels.forEach(function (panel) {
      var scope = panel.closest("section") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var emptyState = scope.querySelector("[data-empty-state]");

      if (cards.length === 0) {
        scope = document;
        cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
        emptyState = scope.querySelector("[data-empty-state]");
      }
      var searchInput = panel.querySelector("[data-search-input]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var regionSelect = panel.querySelector("[data-filter-region]");
      var typeSelect = panel.querySelector("[data-filter-type]");

      function apply() {
        var query = textOf(searchInput && searchInput.value);
        var year = textOf(yearSelect && yearSelect.value);
        var region = textOf(regionSelect && regionSelect.value);
        var type = textOf(typeSelect && typeSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var search = textOf(card.getAttribute("data-search"));
          var cardYear = textOf(card.getAttribute("data-year"));
          var cardRegion = textOf(card.getAttribute("data-region"));
          var cardType = textOf(card.getAttribute("data-type"));
          var matched = true;

          if (query && search.indexOf(query) === -1) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          if (region && cardRegion !== region) {
            matched = false;
          }
          if (type && cardType !== type) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      }

      [searchInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    show(0);
    play();
  }
})();

function initMoviePlayer(sourceUrl, HlsLibrary) {
  var video = document.querySelector("[data-player]");
  var overlay = document.querySelector("[data-play-overlay]");
  var loaded = false;
  var hlsInstance = null;
  var HlsCtor = HlsLibrary || window.Hls;

  if (!video || !overlay || !sourceUrl) {
    return;
  }

  function loadSource() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (HlsCtor && HlsCtor.isSupported()) {
      hlsInstance = new HlsCtor({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function startPlayback(event) {
    if (event) {
      event.preventDefault();
    }

    overlay.classList.add("is-hidden");
    loadSource();

    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", startPlayback);

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });

  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
