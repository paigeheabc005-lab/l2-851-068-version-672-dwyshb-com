(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-menu]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var previous = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
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

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    filterInputs.forEach(function (input) {
      var targetSelector = input.getAttribute("data-filter-input");
      var target = document.querySelector(targetSelector);
      var counter = document.querySelector(input.getAttribute("data-filter-count"));
      var empty = document.querySelector(input.getAttribute("data-filter-empty"));
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));

      function applyFilter() {
        var query = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var matched = !query || text.indexOf(query) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (counter) {
          counter.textContent = String(visible);
        }
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      input.addEventListener("input", applyFilter);
      applyFilter();
    });
  }

  function movieCard(movie) {
    var title = escapeHtml(movie.title);
    var href = "movie/" + movie.id + ".html";
    return [
      '<a class="movie-card" href="' + href + '" data-search="' + escapeHtml(movie.search) + '">',
      '  <span class="poster-frame">',
      '    <img src="' + movie.image + '" alt="' + title + '" loading="lazy">',
      '    <span class="poster-gradient"></span>',
      '    <span class="card-badge">' + escapeHtml(movie.category) + '</span>',
      '    <span class="card-rating">★ ' + movie.rating + '</span>',
      '  </span>',
      '  <span class="card-body">',
      '    <strong>' + title + '</strong>',
      '    <em>' + escapeHtml(movie.description) + '</em>',
      '    <span class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></span>',
      '  </span>',
      '</a>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function setupSearchPage() {
    var container = document.querySelector("[data-search-results]");
    if (!container || !window.MOVIES) {
      return;
    }
    var input = document.querySelector("[data-search-page-input]");
    var count = document.querySelector("[data-search-page-count]");
    var empty = document.querySelector("[data-search-page-empty]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }

    function render() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var results = window.MOVIES.filter(function (movie) {
        return !query || movie.search.toLowerCase().indexOf(query) !== -1;
      }).slice(0, 240);
      container.innerHTML = results.map(movieCard).join("");
      if (count) {
        count.textContent = String(results.length);
      }
      if (empty) {
        empty.classList.toggle("show", results.length === 0);
      }
    }

    if (input) {
      input.addEventListener("input", render);
    }
    render();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-overlay");
      var status = player.querySelector(".player-status");
      var source = player.getAttribute("data-src");
      var hls = null;
      var sourceAttached = false;

      if (!video || !source) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function attachSource() {
        if (sourceAttached) {
          return Promise.resolve();
        }
        sourceAttached = true;
        setStatus("正在载入播放源...");
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("点击播放");
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("视频加载失败，请稍后重试");
            }
          });
          return Promise.resolve();
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          setStatus("点击播放");
          return Promise.resolve();
        }
        setStatus("浏览器不支持该播放源");
        return Promise.reject(new Error("HLS is not supported"));
      }

      function playVideo() {
        attachSource().then(function () {
          video.controls = true;
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
              setStatus("请再次点击播放");
            });
          }
        }).catch(function () {});
      }

      function toggleVideo() {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          playVideo();
        });
      }

      video.addEventListener("click", toggleVideo);
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });
      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
      });
      video.addEventListener("error", function () {
        setStatus("视频加载失败，请稍后重试");
      });

      attachSource().catch(function () {});
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHeroSlider();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
