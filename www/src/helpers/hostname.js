export function localized(path) {
  const { hostname } = window.location
  const proto = window.location.protocol
  const { port } = window.location

  if (!port) {
    return `${proto}//${hostname}${path}`
  }

  return `${proto}//${hostname}:${port}${path}`
}

export function host() {
  const { hostname, protocol, port } = window.location
  const base = `${protocol}//${hostname}`

  if (port) return `${base}:${port}`

  return base
}

export function apiHost() {
  switch (window.location.hostname) {
  case 'localhost':
    return 'app.plural.sh'
  default:
    return window.location.hostname
  }
}

export function secure() {
  return window.location.protocol.indexOf('https') >= 0
}
