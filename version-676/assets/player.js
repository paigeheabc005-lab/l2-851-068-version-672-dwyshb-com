(function () {
  window.startPlayer = function (streamUrl) {
    var wrap = document.querySelector(".player-wrap");

    if (!wrap) {
      return;
    }

    var video = wrap.querySelector("video");
    var button = wrap.querySelector(".play-overlay");
    var loaded = false;
    var hls = null;

    function loadStream() {
      if (loaded || !video) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      loaded = true;
    }

    function begin() {
      loadStream();
      wrap.classList.add("is-playing");
      var task = video.play();

      if (task && task.catch) {
        task.catch(function () {
          wrap.classList.remove("is-playing");
        });
      }
    }

    if (button) {
      button.addEventListener("click", begin);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });

    video.addEventListener("play", function () {
      wrap.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      wrap.classList.remove("is-playing");
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });

    loadStream();
  };
})();
