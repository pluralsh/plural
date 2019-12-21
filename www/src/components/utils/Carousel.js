import React, {useState, useEffect} from 'react'
import Carousel from '@brainhubeu/react-carousel'
import {lookahead} from '../../utils/array'
import '@brainhubeu/react-carousel/lib/style.css'


export default function WrappedCarousel({edges, mapper, fetchMore, ...props}) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (index >= edges.length - 1) {
      fetchMore && fetchMore()
    }
  }, [index, edges, fetchMore])

  let entries = Array.from(lookahead(edges, (edge, next) => mapper(edge, next)))
  return (
    <Carousel onChange={setIndex} {...props}>
      {entries}
    </Carousel>
  )
}