import isPropValid from '@emotion/is-prop-valid'

// context: https://styled-components.com/docs/faqs#shouldforwardprop-is-no-longer-provided-by-default
// there are very few cases of this between the DS and app, but this'll catch any remaining that are missed
export function shouldForwardProp(propName, target) {
  if (typeof target === 'string') {
    return isPropValid(propName)
  }

  return true
}
