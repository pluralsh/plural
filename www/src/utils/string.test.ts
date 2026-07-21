import { isValidUrl, pluralize } from './string'

describe('string utils', () => {
  // isValidUrl is used as a form error flag: true === invalid
  describe('isValidUrl', () => {
    it('flags empty and malformed values as invalid', () => {
      expect(isValidUrl('')).toBe(true)
      expect(isValidUrl('not a url')).toBe(true)
      expect(isValidUrl('localhost')).toBe(true)
      expect(isValidUrl('http://localhost')).toBe(true)
    })

    it('accepts dotted hostnames with or without a scheme', () => {
      expect(isValidUrl('example.com')).toBe(false)
      expect(isValidUrl('https://example.com')).toBe(false)
      expect(isValidUrl('http://example.com/path?x=1')).toBe(false)
      expect(isValidUrl('sub.domain.example.com')).toBe(false)
    })

    it('does not hang on pathological ReDoS inputs', () => {
      const payload = `-.${'-.'.repeat(5000)}x`
      const start = Date.now()
      expect(isValidUrl(payload)).toBe(true)
      expect(Date.now() - start).toBeLessThan(1000)
    })
  })

  describe('pluralize', () => {
    it('adds s for zero and plural counts', () => {
      expect(pluralize('item', 0)).toBe('items')
      expect(pluralize('item', 1)).toBe('item')
      expect(pluralize('item', 2)).toBe('items')
    })
  })
})
