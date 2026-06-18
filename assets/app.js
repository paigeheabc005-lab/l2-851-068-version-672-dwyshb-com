(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupNavigation() {
        var header = document.querySelector('.site-header');
        var button = document.querySelector('.nav-toggle');
        if (!header || !button) {
            return;
        }
        button.addEventListener('click', function () {
            var open = header.classList.toggle('nav-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', carousel);
        var dots = selectAll('[data-hero-dot]', carousel);
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
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

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupLocalFilters() {
        var bars = selectAll('[data-filter-bar]');
        bars.forEach(function (bar) {
            var section = bar.closest('section');
            var cards = selectAll('.movie-card', section);
            var keyword = bar.querySelector('[data-filter-keyword]');
            var type = bar.querySelector('[data-filter-type]');
            var year = bar.querySelector('[data-filter-year]');

            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }

            function apply() {
                var q = normalize(keyword && keyword.value);
                var t = normalize(type && type.value);
                var y = normalize(year && year.value);
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var visible = true;
                    if (q && haystack.indexOf(q) === -1) {
                        visible = false;
                    }
                    if (t && normalize(card.getAttribute('data-type')) !== t) {
                        visible = false;
                    }
                    if (y && normalize(card.getAttribute('data-year')) !== y) {
                        visible = false;
                    }
                    card.classList.toggle('is-hidden', !visible);
                });
            }

            [keyword, type, year].forEach(function (node) {
                if (node) {
                    node.addEventListener('input', apply);
                    node.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function buildSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a href="' + escapeHtml(movie.file) + '" class="card-link" aria-label="观看' + escapeHtml(movie.title) + '">' +
            '<div class="card-cover card-cover-normal">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<div class="card-hover"><span>▶</span></div>' +
            '<span class="quality-badge">超清</span>' +
            '</div>' +
            '<div class="card-body">' +
            '<h2>' + escapeHtml(movie.title) + '</h2>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
            '<div class="card-tags"><span>' + escapeHtml(movie.categoryName) + '</span>' + tags + '</div>' +
            '</div>' +
            '</a>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setupSearchPage() {
        var form = document.querySelector('[data-search-form]');
        var input = document.querySelector('[data-search-input]');
        var results = document.querySelector('[data-search-results]');
        if (!form || !input || !results || !window.MOVIE_INDEX) {
            return;
        }
        var typeSelect = document.querySelector('[data-search-type]');
        var sortSelect = document.querySelector('[data-search-sort]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function render() {
            var q = normalize(input.value);
            var type = normalize(typeSelect && typeSelect.value);
            var sort = sortSelect ? sortSelect.value : 'match';
            var list = window.MOVIE_INDEX.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.categoryName,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' '));
                if (q && haystack.indexOf(q) === -1) {
                    return false;
                }
                if (type && normalize(movie.type) !== type) {
                    return false;
                }
                return true;
            });

            if (sort === 'year') {
                list.sort(function (a, b) {
                    return Number(b.year) - Number(a.year) || a.title.localeCompare(b.title, 'zh-Hans-CN');
                });
            }
            if (sort === 'title') {
                list.sort(function (a, b) {
                    return a.title.localeCompare(b.title, 'zh-Hans-CN');
                });
            }

            results.innerHTML = list.slice(0, 120).map(buildSearchCard).join('');
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var url = new URL(window.location.href);
            if (input.value.trim()) {
                url.searchParams.set('q', input.value.trim());
            } else {
                url.searchParams.delete('q');
            }
            window.history.replaceState(null, '', url.toString());
            render();
        });
        [input, typeSelect, sortSelect].forEach(function (node) {
            if (node) {
                node.addEventListener('input', render);
                node.addEventListener('change', render);
            }
        });
        render();
    }

    window.setupMoviePlayer = function (videoId, shellId, source) {
        var video = document.getElementById(videoId);
        var shell = document.getElementById(shellId);
        if (!video || !shell || !source) {
            return;
        }
        var loaded = false;
        var hls = null;

        function attach() {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                return Promise.resolve();
            }
            video.src = source;
            return Promise.resolve();
        }

        function start() {
            attach().then(function () {
                shell.classList.add('is-playing');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        shell.classList.remove('is-playing');
                    });
                }
            });
        }

        selectAll('[data-player-action="play"]', shell).forEach(function (button) {
            button.addEventListener('click', start);
        });

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupNavigation();
        setupHero();
        setupLocalFilters();
        setupSearchPage();
    });
})();
