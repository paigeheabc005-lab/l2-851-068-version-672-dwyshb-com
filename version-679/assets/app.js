(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
    setupBackTop();
    applySearchQuery();
  });

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".nav-menu");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(
      document.querySelectorAll(".hero-slide"),
    );
    var dots = Array.prototype.slice.call(
      document.querySelectorAll(".hero-dot"),
    );

    if (slides.length === 0) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    show(0);
    start();

    var hero = document.querySelector(".hero-carousel");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }
  }

  function setupFilters() {
    var cards = Array.prototype.slice.call(
      document.querySelectorAll(".movie-card"),
    );
    var input = document.querySelector(".page-search-input");
    var buttons = Array.prototype.slice.call(
      document.querySelectorAll(".filter-button"),
    );

    if (cards.length === 0) {
      return;
    }

    var activeValue = "all";

    function normalize(value) {
      return String(value || "")
        .trim()
        .toLowerCase();
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var filter = normalize(activeValue);

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedFilter = filter === "all" || text.indexOf(filter) !== -1;
        card.hidden = !(matchedQuery && matchedFilter);
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeValue = button.getAttribute("data-filter-value") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        apply();
      });
    });

    apply();
  }

  function applySearchQuery() {
    var input = document.querySelector(".page-search-input");
    if (!input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query) {
      input.value = query;
      input.dispatchEvent(new Event("input"));
    }
  }

  function setupPlayer() {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("play-cover");

    if (!video || typeof streamUrl === "undefined") {
      return;
    }

    var attached = false;

    function attach() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function play() {
      attach();

      if (cover) {
        cover.classList.add("hidden");
      }

      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }

  function setupBackTop() {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "back-top";
    button.setAttribute("aria-label", "返回顶部");
    button.textContent = "↑";
    document.body.appendChild(button);

    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    window.addEventListener("scroll", function () {
      button.classList.toggle("visible", window.scrollY > 420);
    });
  }
})();
