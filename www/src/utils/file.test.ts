import { generatePreview } from './file'

describe('generatePreview', () => {
  it('should return a FileReader object', () => {
    const file = new File(['foo'], 'foo.txt', { type: 'text/plain' })
    const result = generatePreview(file, () => {})

    expect(result).toBeInstanceOf(FileReader)
  })

  it('should call the callback with the file and previewUrl', () => {
    const file = new File(['foo'], 'foo.txt', { type: 'text/plain' })
    const mockCallback = vitest.fn()

    generatePreview(file, mockCallback)

    expect(mockCallback).toHaveBeenCalledWith({
      file,
      previewUrl: expect.any(String),
    })
  })
})
