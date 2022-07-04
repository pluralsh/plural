export function generatePreview(file, callback) {
  const reader = new FileReader()

  reader.onloadend = () => callback({
    file,
    previewUrl: reader.result,
  })
  reader.readAsDataURL(file)
}

export function download(url) {
  const tempLink = document.createElement('a')
  tempLink.style.display = 'none'
  tempLink.href = url
  tempLink.setAttribute('download', 'true')

  // Safari thinks _blank anchor are pop ups. We only want to set _blank
  // target if the browser does not support the HTML5 download attribute.
  // This allows you to download files in desktop safari if pop up blocking
  // is enabled.
  if (typeof tempLink.download === 'undefined') {
    tempLink.setAttribute('target', '_blank')
  }

  document.body.appendChild(tempLink)
  tempLink.click()

  // Fixes "webkit blob resource error 1"
  setTimeout(() => {
    document.body.removeChild(tempLink)
  }, 0)
}
