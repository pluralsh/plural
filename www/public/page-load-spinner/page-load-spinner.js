// Don't show spinner until all images loaded
(function () {
  var loadCount = 0;
  var numImages = 2;
  var tickCount = 0;
  var tickInterval;
  var images = [
    "/logos/plural-logomark-only-white.svg",
    "/page-load-spinner/page-load-spinner-bg.png",
  ];

  function imageLoaded(event) {
    loadCount++;
    if (loadCount >= numImages) {
      document.querySelector("#loading-placeholder").classList.add("show");
      tickInterval = setInterval(() => {
        tickCount = tickCount >= 4 ? 0 : tickCount + 1;
        document
          .querySelectorAll("#loading-placeholder .dot")
          .forEach(function (dot) {
            if (tickCount >= Number(dot.getAttribute("data-dot-num"))) {
              dot.classList.add("show");
            } else {
              dot.classList.remove("show");
            }
          });
      }, 200);
    }
  }

  var listenerRemovers = images.map(function (imageUrl) {
    var logoImg = document.createElement("img");
    logoImg.src = imageUrl;
    logoImg.addEventListener("load", imageLoaded);
    return function () {
      logoImg.removeEventListener("load", imageLoaded);
    };
  });

  // Cleanup callbacks once app has loaded
  var rootNode = document.getElementById("root");
  var rootObserver = new MutationObserver(function (mutationList, observer) {
    if (rootNode.hasChildNodes) {
      window.clearInterval(tickInterval);
      listenerRemovers.forEach(function (remover) {
        remover();
      });
    }
  });
  rootObserver.observe(document.getElementById("root"), { childList: true });
})();
