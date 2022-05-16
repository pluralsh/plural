import { useEffect, useRef } from 'react'
import { Div } from 'honorable'

function InfiniteScroller({ loading = false, hasMore = false, loadMore, children, ...props }) {
  const scrollRef = useRef()

  useEffect(() => {
    const { current } = scrollRef

    if (!current) return

    function handleScroll(event) {
      if (
        typeof loadMore === 'function'
        && !loading
        && hasMore
        && Math.abs(event.target.scrollTop - (event.target.scrollHeight - event.target.offsetHeight)) < 32
      ) {
        loadMore()
      }
    }

    current.addEventListener('scroll', handleScroll)

    return () => {
      current.removeEventListener('scroll', handleScroll)
    }
  }, [loading, hasMore, loadMore])

  return (
    <Div
      ref={scrollRef}
      overflowY="auto"
      {...props}
    >
      {children}
    </Div>
  )
}

export default InfiniteScroller
