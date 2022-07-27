const parseHeaders = rawHeaders => {
  const headers = new Headers()
  // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
  // https://tools.ietf.org/html/rfc7230#section-3.2
  const preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ')

  preProcessedHeaders.split(/\r?\n/).forEach(line => {
    const parts = line.split(':')
    const key = parts.shift().trim()

    if (key) {
      const value = parts.join(':').trim()

      headers.append(key, value)
    }
  })

  return headers
}

export const uploadFetch = (url, options) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest()

  xhr.onload = () => {
    const opts = {
      status: xhr.status,
      statusText: xhr.statusText,
      headers: parseHeaders(xhr.getAllResponseHeaders() || ''),
    }

    opts.url
        = 'responseURL' in xhr
        ? xhr.responseURL
        : opts.headers.get('X-Request-URL')
    const body = 'response' in xhr ? xhr.response : (xhr).responseText

    resolve(new Response(body, opts))
  }
  xhr.onerror = () => {
    reject(new TypeError('Network request failed'))
  }
  xhr.ontimeout = () => {
    reject(new TypeError('Network request failed'))
  }
  xhr.open(options.method, url, true)

  Object.keys(options.headers).forEach(key => {
    xhr.setRequestHeader(key, options.headers[key])
  })
  if (xhr.upload) {
    xhr.upload.onprogress = options.onProgress
  }

  options.onAbortPossible(() => {
    xhr.abort()
  })
  xhr.send(options.body)
})
const customFetch = (uri, options) => {
  if (options.useUpload) {
    return uploadFetch(uri, options)
  }

  return fetch(uri, options)
}

export default customFetch
