document.addEventListener('DOMContentLoaded', function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(dotIndex);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(searchInput ? searchInput.value : '');
    var typeValue = typeFilter ? typeFilter.value : 'all';
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search-card'));
      var cardType = card.getAttribute('data-card-type') || '';
      var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchedType = typeValue === 'all' || cardType === typeValue;
      var matched = matchedKeyword && matchedType;

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? 'none' : 'block';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', filterCards);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-button');
    var url = video ? video.getAttribute('data-url') : '';
    var started = false;
    var hls = null;

    function playVideo(event) {
      if (event) {
        event.preventDefault();
      }

      if (!video || !url) {
        return;
      }

      shell.classList.add('is-playing');

      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.load();
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal || !hls) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }

          hls.destroy();
        });
        return;
      }

      video.src = url;
      video.load();
      video.play().catch(function () {});
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video && started) {
        return;
      }

      if (event.target.closest && event.target.closest('video')) {
        return;
      }

      playVideo(event);
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
  });
});
