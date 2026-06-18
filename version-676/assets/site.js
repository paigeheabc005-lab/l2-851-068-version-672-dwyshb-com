(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".main-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

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

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });

    show(0);
    play();
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var regionSelect = document.querySelector("[data-filter-region]");
  var yearSelect = document.querySelector("[data-filter-year]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

  function matchCard(card) {
    var q = filterInput ? filterInput.value.trim().toLowerCase() : "";
    var region = regionSelect ? regionSelect.value : "";
    var year = yearSelect ? yearSelect.value : "";
    var text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year].join(" ").toLowerCase();
    var okText = !q || text.indexOf(q) !== -1;
    var okRegion = !region || card.dataset.region === region;
    var okYear = !year || card.dataset.year === year;
    return okText && okRegion && okYear;
  }

  function runFilter() {
    cards.forEach(function (card) {
      card.classList.toggle("is-hidden", !matchCard(card));
    });
  }

  [filterInput, regionSelect, yearSelect].forEach(function (el) {
    if (el) {
      el.addEventListener("input", runFilter);
      el.addEventListener("change", runFilter);
    }
  });
})();
