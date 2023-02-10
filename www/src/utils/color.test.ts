import { shadeColor } from './color'

describe('shadeColor', () => {
  it('should return the correct color when given a valid hex color and percent', () => {
    expect(shadeColor('#FF0000', 0.5)).toBe('#ff7f7f')
  })

  it('should return the same color when given a percent of 0', () => {
    expect(shadeColor('#FF0000', 0)).toBe('#ff0000')
  })

  it('should return the same color when given a percent greater than 1', () => {
    expect(shadeColor('#FF0000', 2)).toBe('#ff0000')
  })

  it('should throw an error when given an invalid hex color', () => {
    expect(() => shadeColor('invalid-color', 0.5)).toThrowError()
  })

  it('should throw an error when given an invalid percent value', () => {
    expect(() => shadeColor('#FF0000', 'invalid-percent')).toThrowError()
  })
})
