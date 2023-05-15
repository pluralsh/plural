const isProduction = import.meta.env.PROD
const url = import.meta.url || ''
const isServiceWorkerAvailable = 'serviceWorker' in navigator
const serviceWorkerURL = '/service-worker.js'
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // ignore on preview branches
    window.location.hostname.endsWith('web.app') ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
)

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void
  onUpdate?: (registration: ServiceWorkerRegistration) => void
}

export const register = (config: Config): void => {
  const publicURL = new URL(url, window.location.href)

  if (!isProduction || !isServiceWorkerAvailable) {
    return
  }

  if (publicURL.origin !== window.location.origin) {
    // Our service worker won't work if PUBLIC_URL is on a different origin
    // from what our page is served on. This might happen if a CDN is used to
    // serve assets
    return
  }

  window.addEventListener('load', onLoad(config))
}

const onLoad = (config) => async () => {
  if (!isLocalhost) {
    await registerServiceWorker(config)

    return
  }

  const hasServiceWorker = await checkServiceWorker()

  if (!hasServiceWorker) {
    navigator.serviceWorker.ready.then((registration) =>
      registration.unregister().then(() => window.location.reload())
    )

    return
  }

  await registerServiceWorker(config)

  // Add some additional logging to localhost, pointing developers to the
  // service worker/PWA documentation.
  navigator.serviceWorker.ready.then(() => {
    console.log(
      'This web app is being served cache-first by a service ' + 'worker.'
    )
  })
}

const checkServiceWorker = (): Promise<boolean | void> =>
  fetch(serviceWorkerURL, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const contentType = response.headers.get('content-type')

      return !(
        response.status === 404 || contentType?.indexOf('javascript') === -1
      )
    })
    .catch(() =>
      console.log(
        'No internet connection found. App is running in offline mode.'
      )
    )

const registerServiceWorker = async (config) => {
  const registration = await navigator.serviceWorker.register(serviceWorkerURL)

  registration.onupdatefound = onServiceWorkerUpdateFound(registration, config)
}

const onServiceWorkerUpdateFound =
  (registration: ServiceWorkerRegistration, config) => () => {
    const { installing } = registration

    if (!installing) return

    installing.onstatechange = onServiceWorkerStateChange(registration, config)
  }

const onServiceWorkerStateChange =
  (registration: ServiceWorkerRegistration, config: Config) => () => {
    const { installing } = registration

    if (installing?.state !== 'installed') return

    if (!navigator.serviceWorker.controller) {
      // At this point, everything has been precached.
      // It's the perfect time to display a
      // "Content is cached for offline use." message.
      console.log('Content is cached for offline use.')

      // Execute callback
      if (config?.onSuccess) {
        config.onSuccess(registration)
      }

      return
    }

    console.log(
      'New content is available and will be used when all ' +
        'tabs for this page are closed.'
    )

    // Execute callback
    if (config?.onUpdate) {
      config.onUpdate(registration)
    }
  }

export const unregister = async () => {
  if (!isServiceWorkerAvailable) return

  const registrations = await navigator.serviceWorker.getRegistrations()
  const unregisterPromises = registrations.map((r) => r.unregister())

  const allCaches = await caches.keys()
  const cacheDeletionPromises = allCaches.map((c) => caches.delete(c))

  await Promise.all([...unregisterPromises, ...cacheDeletionPromises])
}
