import { isValidEmail } from './email'

describe('Email utils', () => {
  it('should detect valid email addresses', () => {
    expect(isValidEmail('marcin@plural.sh')).toBeTruthy()
    expect(isValidEmail('marcin.123@plural.sh')).toBeTruthy()
    expect(isValidEmail('marcin.123@plural.123.sh')).toBeTruthy()
    expect(isValidEmail('移动@移动.移动')).toBeTruthy()
    expect(isValidEmail('laniña@somwhere.mx')).toBeTruthy()
    expect(isValidEmail('person@a.b.c.d')).toBeTruthy()

    expect(isValidEmail('')).toBeFalsy()
    expect(isValidEmail('marcin')).toBeFalsy()
    expect(isValidEmail('marcin@plural')).toBeFalsy()
    expect(isValidEmail('marcin@plural.sh@plural.sh')).toBeFalsy()
    expect(isValidEmail('@a.com')).toBeFalsy()
    expect(isValidEmail('a.com')).toBeFalsy()
    expect(isValidEmail('person@a..')).toBeFalsy()
    expect(isValidEmail('person@a..com')).toBeFalsy()
    expect(isValidEmail('person@..com')).toBeFalsy()
    expect(isValidEmail('person@.a..com')).toBeFalsy()
    expect(isValidEmail('person@.a.com')).toBeFalsy()
    expect(isValidEmail('person@...')).toBeFalsy()
  })
})

describe('isValidEmail', () => {
  it('should return true for valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
  })

  it('should return false for invalid emails', () => {
    expect(isValidEmail('test@example')).toBe(false)
  })

  it('should return false for empty strings', () => {
    expect(isValidEmail('')).toBe(false)
  })

  it('should return false for non-string values', () => {
    expect(isValidEmail({})).toBe(false)
    expect(isValidEmail([])).toBe(false)
    expect(isValidEmail()).toBe(false) // undefined value should return false;
  })
})
