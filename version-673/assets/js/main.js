(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function normalize(text) {
    return (text || '').toString().trim().toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (slides.length > 1) {
      var current = 0;
      var showSlide = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          showSlide(i);
        });
      });
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var filterSelect = document.querySelector('[data-filter-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
    var emptyBox = document.querySelector('[data-empty-result]');
    var filterCards = function () {
      var q = normalize(searchInput ? searchInput.value : '');
      var selected = filterSelect ? filterSelect.value : '';
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-category')
        ].join(' '));
        var selectedMatch = !selected || haystack.indexOf(normalize(selected)) !== -1;
        var queryMatch = !q || haystack.indexOf(q) !== -1;
        var visible = selectedMatch && queryMatch;
        card.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });
      if (emptyBox) {
        emptyBox.classList.toggle('visible', shown === 0);
      }
    };
    if (searchInput) {
      searchInput.addEventListener('input', filterCards);
    }
    if (filterSelect) {
      filterSelect.addEventListener('change', filterCards);
    }
  });
})();

function initMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var button = document.getElementById(config.buttonId);
  var cover = document.getElementById(config.overlayId);
  var loaded = false;
  var hls = null;
  var start = function () {
    if (!video || loaded) {
      if (video) {
        var replay = video.play();
        if (replay && replay.catch) {
          replay.catch(function () {});
        }
      }
      return;
    }
    loaded = true;
    video.setAttribute('controls', 'controls');
    video.setAttribute('playsinline', 'playsinline');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(config.source);
      hls.attachMedia(video);
    } else {
      video.src = config.source;
    }
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var playing = video.play();
    if (playing && playing.catch) {
      playing.catch(function () {});
    }
  };
  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
  }
  if (cover) {
    cover.addEventListener('click', start);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (!loaded) {
        start();
      }
    });
    video.addEventListener('ended', function () {
      if (hls && hls.destroy) {
        hls.destroy();
        hls = null;
      }
    });
  }
}
