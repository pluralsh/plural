class TimedCache {
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
    for (let timeout of Object.values(this.cache)) {
      clearTimeout(timeout)
    }
  }
}

export default TimedCache