export const ignore = (e) => { e.preventDefault(); e.stopPropagation() }

export const ignored = (f) => {
  return (e, ...args) => {
    ignore(e)
    f(e, ...args)
  }
}