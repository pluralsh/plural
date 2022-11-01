class TimedCache {
  cache: any

  timeout: any

  subscription: any

  constructor(timeout, subscription) {
    this.cache = {}
    this.timeout = timeout
    this.subscription = subscription
  }

  add(id) {
    if (this.cache[id]) {
      clearTimeout(this.cache[id])
    }
    this.cache[id] = setTimeout(() => {
      delete this.cache[id]
      this.subscription(Object.keys(this.cache))
    }, this.timeout)

    this.subscription(Object.keys(this.cache))
  }

  clear() {
    for (const timeout of Object.values(this.cache)) {
      clearTimeout(timeout as any)
    }
  }
}

export default TimedCache
