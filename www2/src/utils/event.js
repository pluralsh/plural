export const ignore = e => {
  e.preventDefault(); e.stopPropagation() 
}

export const ignored = f => (e, ...args) => {
  ignore(e)
  f(e, ...args)
}
