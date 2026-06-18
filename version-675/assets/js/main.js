document.addEventListener("DOMContentLoaded", function () {
    var header = document.getElementById("siteHeader");
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    function syncHeader() {
        if (!header || header.classList.contains("is-solid")) {
            return;
        }
        header.classList.toggle("is-scrolled", window.scrollY > 20);
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("is-active", idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("is-active", idx === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide-dot")) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get("q") || "";
    var panel = document.querySelector("[data-filter-panel]");
    if (panel) {
        var input = panel.querySelector("[data-filter-input]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var grid = document.querySelector("[data-movie-grid]");
        var empty = document.querySelector("[data-empty-state]");
        var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];

        if (input && queryFromUrl) {
            input.value = queryFromUrl;
        }

        function normalize(value) {
            return String(value || "").toLowerCase().replace(/\s+/g, "");
        }

        function applyFilters() {
            var keyword = normalize(input ? input.value : "");
            var typeValue = normalize(typeSelect ? typeSelect.value : "");
            var yearValue = normalize(yearSelect ? yearSelect.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-type"),
                    card.textContent
                ].join(" "));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matched = (!keyword || haystack.indexOf(keyword) !== -1) && (!typeValue || cardType.indexOf(typeValue) !== -1) && (!yearValue || cardYear.indexOf(yearValue) !== -1);
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, typeSelect, yearSelect].forEach(function (node) {
            if (node) {
                node.addEventListener("input", applyFilters);
                node.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    }
});
