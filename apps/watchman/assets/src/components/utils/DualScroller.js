import React, { useRef, useEffect, useState } from "react"
import {lookahead} from '../../utils/array'
import scrollIntoView from 'scroll-into-view'
import {debounce} from 'lodash'

export const DIRECTION = {
  BEFORE: "before",
  AFTER: "after"
}

function DualScroller(props) {
  const scrollRef = useRef()
  const [pos, setPos] = useState(0)

  const updatePosition = debounce((pos) => setPos(pos), 100, {leading: true})

  useEffect(() => {
    if (props.scrollTo) {
      scrollIntoView(document.getElementById(props.scrollTo), {time: 100, align: {top: 0}})
    }
  }, [props.scrollTo])

  const handleOnScroll = () => {
    const elem = scrollRef.current
    const offset = (props.offset || 0) * elem.scrollHeight

    if (elem.scrollTop >= (elem.scrollHeight - elem.offsetHeight - offset)) {
      props.onLoadMore(DIRECTION.AFTER)
    }

    if (elem.scrollTop <= elem.offsetHeight + offset) {
      props.onLoadMore(DIRECTION.BEFORE)
    }
    updatePosition(elem.scrollTop)
  }

  const entries = Array.from(lookahead(props.edges, (edge, next) => props.mapper(edge, next, scrollRef, pos)))
  return (
    <div ref={scrollRef} id={props.id} onScroll={handleOnScroll} style={props.style}>
      {entries.length > 0 ? entries : props.emptyState}
    </div>
  )
}

export default DualScroller