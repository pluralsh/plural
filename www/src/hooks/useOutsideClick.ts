import { RefObject, useEffect } from 'react'

export function useOutsideClick(
  ref: RefObject<HTMLElement | null>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    function handleClick(event: MouseEvent | TouchEvent) {
      // composedPath() is fixed at dispatch time, so it still includes the
      // target if React re-rendered it out of the DOM during this click.
      if (!ref.current || event.composedPath().includes(ref.current)) return

      handler(event)
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('touchstart', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [ref, handler])
}
