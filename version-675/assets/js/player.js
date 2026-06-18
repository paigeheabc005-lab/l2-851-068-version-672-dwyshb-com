document.addEventListener("DOMContentLoaded", function () {
    var box = document.querySelector(".player-box");
    if (!box) {
        return;
    }

    var video = box.querySelector("video");
    var button = box.querySelector(".play-overlay");
    var url = box.getAttribute("data-video");
    var ready = false;
    var hls = null;

    function bindVideo() {
        if (ready || !video || !url) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else {
            video.src = url;
        }

        ready = true;
    }

    function startPlay() {
        bindVideo();
        box.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                box.classList.remove("is-playing");
            });
        }
    }

    if (button) {
        button.addEventListener("click", startPlay);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlay();
            }
        });
        video.addEventListener("play", function () {
            box.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                box.classList.remove("is-playing");
            }
        });
    }

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
        }
    });
});
