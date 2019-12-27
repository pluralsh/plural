import React, {useState, useEffect} from 'react'
import CarouselInner from '@brainhubeu/react-carousel'
import {lookahead} from '../../utils/array'
import '@brainhubeu/react-carousel/lib/style.css'


export default function Carousel({edges, mapper, fetchMore, ...props}) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (index >= edges.length - 1) {
      fetchMore && fetchMore()
    }
  }, [index, edges, fetchMore])

  let entries = Array.from(lookahead(edges, (edge, next) => mapper(edge, next)))
  return (
    <CarouselInner onChange={setIndex} {...props}>
      {entries}
    </CarouselInner>
  )
}