// Don't show spinner until all images loaded
(function pageLoadSpinner() {
  let loadCount = 0
  const numImages = 2
  let tickCount = 0
  let tickInterval
  const images = [
    '/page-load-spinner/page-load-spinner-logo.svg',
    '/page-load-spinner/page-load-spinner-bg.png',
  ]

  function imageLoaded() {
    loadCount++
    if (loadCount >= numImages) {
      document.querySelector('#loading-placeholder').classList.add('show')
      tickInterval = setInterval(() => {
        tickCount = tickCount >= 4 ? 0 : tickCount + 1
        document
          .querySelectorAll('#loading-placeholder .dot')
          .forEach(dot => {
            if (tickCount >= Number(dot.getAttribute('data-dot-num'))) {
              dot.classList.add('show')
            }
            else {
              dot.classList.remove('show')
            }
          })
      }, 200)
    }
  }

  const listenerRemovers = images.map(imageUrl => {
    const logoImg = document.createElement('img')
    logoImg.src = imageUrl
    logoImg.addEventListener('load', imageLoaded)

    return function cleanUp() {
      logoImg.removeEventListener('load', imageLoaded)
    }
  })

  // Cleanup callbacks once app has loaded
  const rootNode = document.getElementById('root')
  const rootObserver = new MutationObserver(() => {
    if (rootNode.hasChildNodes) {
      window.clearInterval(tickInterval)
      listenerRemovers.forEach(remover => {
        remover()
      })
    }
  })
  rootObserver.observe(document.getElementById('root'), { childList: true })
}())
