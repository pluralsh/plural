export function localized(path) {
  const hostname = window.location.hostname
  const proto    = window.location.protocol
  const port     = window.location.port
  if (!port) {
    return `${proto}//${hostname}${path}`
  }
  return `${proto}//${hostname}:${port}${path}`
}

export function apiHost() {
  switch (window.location.hostname) {
    case "localhost":
      return "mart.piazzaapp.com"
    default:
      return window.location.hostname.replace("forge", "mart")
  }
}

export function secure() {
  return window.location.protocol.indexOf('https') >= 0
}