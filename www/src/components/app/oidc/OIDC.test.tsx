import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UrlsInput } from './OIDC'

describe('UrlsInput', () => {
  describe('URL construction', () => {
    it('should construct URL with scheme and path when uriFormat contains {domain}', async () => {
      const setUrls = vi.fn()
      const urls: string[] = []
      const uriFormat = 'https://{domain}/oauth2/callback'

      const { container } = render(
        <UrlsInput
          uriFormat={uriFormat}
          urls={urls}
          setUrls={setUrls}
        />
      )

      const input = container.querySelector('input')
      const addButton = screen.getByText('Add')

      expect(input).not.toBeNull()

      if (input) {
        fireEvent.change(input, { target: { value: 'example.com' } })
        fireEvent.click(addButton)

        await waitFor(() => {
          expect(setUrls).toHaveBeenCalledWith([
            'https://example.com/oauth2/callback',
          ])
        })
      }
    })

    it('should construct URL with default scheme and path when uriFormat is empty', async () => {
      const setUrls = vi.fn()
      const urls: string[] = []
      const uriFormat = ''

      const { container } = render(
        <UrlsInput
          uriFormat={uriFormat}
          urls={urls}
          setUrls={setUrls}
        />
      )

      const input = container.querySelector('input')
      const addButton = screen.getByText('Add')

      expect(input).not.toBeNull()

      if (input) {
        fireEvent.change(input, { target: { value: 'example.com' } })
        fireEvent.click(addButton)

        await waitFor(() => {
          expect(setUrls).toHaveBeenCalledWith([
            'https://example.com/oauth2/callback',
          ])
        })
      }
    })

    it('should construct URL with default scheme and path when uriFormat does not contain {domain}', async () => {
      const setUrls = vi.fn()
      const urls: string[] = []
      const uriFormat = 'some-invalid-format'

      const { container } = render(
        <UrlsInput
          uriFormat={uriFormat}
          urls={urls}
          setUrls={setUrls}
        />
      )

      const input = container.querySelector('input')
      const addButton = screen.getByText('Add')

      expect(input).not.toBeNull()

      if (input) {
        fireEvent.change(input, { target: { value: 'example.com' } })
        fireEvent.click(addButton)

        await waitFor(() => {
          expect(setUrls).toHaveBeenCalledWith([
            'https://example.com/oauth2/callback',
          ])
        })
      }
    })

    it('should construct URL with custom scheme and path when uriFormat has custom format', async () => {
      const setUrls = vi.fn()
      const urls: string[] = []
      const uriFormat = 'http://{domain}/custom/callback'

      const { container } = render(
        <UrlsInput
          uriFormat={uriFormat}
          urls={urls}
          setUrls={setUrls}
        />
      )

      const input = container.querySelector('input')
      const addButton = screen.getByText('Add')

      expect(input).not.toBeNull()

      if (input) {
        fireEvent.change(input, { target: { value: 'example.com' } })
        fireEvent.click(addButton)

        await waitFor(() => {
          expect(setUrls).toHaveBeenCalledWith([
            'http://example.com/custom/callback',
          ])
        })
      }
    })

    it('should not add duplicate URLs', async () => {
      const setUrls = vi.fn()
      const urls = ['https://example.com/oauth2/callback']
      const uriFormat = 'https://{domain}/oauth2/callback'

      const { container } = render(
        <UrlsInput
          uriFormat={uriFormat}
          urls={urls}
          setUrls={setUrls}
        />
      )

      const input = container.querySelector('input')
      const addButton = screen.getByText('Add')

      expect(input).not.toBeNull()

      if (input) {
        fireEvent.change(input, { target: { value: 'example.com' } })
        fireEvent.click(addButton)

        await waitFor(() => {
          expect(setUrls).not.toHaveBeenCalled()
        })
      }
    })

    it('should not add empty URL (base scheme + base path)', async () => {
      const setUrls = vi.fn()
      const urls: string[] = []
      const uriFormat = 'https://{domain}/oauth2/callback'

      const { container } = render(
        <UrlsInput
          uriFormat={uriFormat}
          urls={urls}
          setUrls={setUrls}
        />
      )

      const input = container.querySelector('input')
      const addButton = screen.getByText('Add')

      expect(input).not.toBeNull()

      if (input) {
        fireEvent.change(input, { target: { value: '' } })
        fireEvent.click(addButton)

        await waitFor(() => {
          expect(setUrls).not.toHaveBeenCalled()
        })
      }
    })

    it('should clear input after adding URL', async () => {
      const setUrls = vi.fn()
      const urls: string[] = []
      const uriFormat = 'https://{domain}/oauth2/callback'

      const { container } = render(
        <UrlsInput
          uriFormat={uriFormat}
          urls={urls}
          setUrls={setUrls}
        />
      )

      const input = container.querySelector('input') as HTMLInputElement
      const addButton = screen.getByText('Add')

      expect(input).not.toBeNull()

      if (input) {
        fireEvent.change(input, { target: { value: 'example.com' } })
        expect(input.value).toBe('example.com')

        fireEvent.click(addButton)

        await waitFor(() => {
          expect(input.value).toBe('')
        })
      }
    })
  })

  describe('URL display and removal', () => {
    it('should display existing URLs as chips', () => {
      const setUrls = vi.fn()
      const urls = [
        'https://example1.com/oauth2/callback',
        'https://example2.com/oauth2/callback',
      ]
      const uriFormat = 'https://{domain}/oauth2/callback'

      render(
        <UrlsInput
          uriFormat={uriFormat}
          urls={urls}
          setUrls={setUrls}
        />
      )

      expect(screen.getByText('https://example1.com/oauth2/callback')).toBeInTheDocument()
      expect(screen.getByText('https://example2.com/oauth2/callback')).toBeInTheDocument()
    })

    it('should remove URL when chip is clicked', async () => {
      const setUrls = vi.fn()
      const urls = [
        'https://example1.com/oauth2/callback',
        'https://example2.com/oauth2/callback',
      ]
      const uriFormat = 'https://{domain}/oauth2/callback'

      render(
        <UrlsInput
          uriFormat={uriFormat}
          urls={urls}
          setUrls={setUrls}
        />
      )

      const chip = screen.getByText('https://example1.com/oauth2/callback')

      fireEvent.click(chip)

      await waitFor(() => {
        expect(setUrls).toHaveBeenCalledWith([
          'https://example2.com/oauth2/callback',
        ])
      })
    })
  })
})
