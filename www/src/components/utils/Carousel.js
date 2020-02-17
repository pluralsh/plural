import React, {useState, useEffect} from 'react'
import { FormNext, FormPrevious } from 'grommet-icons'
import CarouselInner from '@brainhubeu/react-carousel'
import {lookahead} from '../../utils/array'
import '@brainhubeu/react-carousel/lib/style.css'
import HoveredBackground from './HoveredBackground'
import { Box } from 'grommet'

function CarouselArrow({icon}) {
  return (
    <HoveredBackground>
      <Box accentable>
        {React.createElement(icon, {style: {cursor: 'pointer'}, size: '30px'})}
      </Box>
    </HoveredBackground>
  )
}

export default function Carousel({edges, mapper, fetchMore, ...props}) {
  const [index, setIndex] = useState(0)
  const len = edges.length
  useEffect(() => {
    if (index >= len - 1) {
      fetchMore && fetchMore()
    }
  }, [index, len, fetchMore])

  let entries = Array.from(lookahead(edges, (edge, next) => mapper(edge, next)))
  return (
    <CarouselInner
      arrowRight={index + 1 < len ?  <CarouselArrow icon={FormNext} /> : null}
      arrowLeft={index > 0 ? <CarouselArrow icon={FormPrevious} /> : null}
      addArrowClickHandler
      value={index}
      onChange={setIndex} {...props}>
      {entries}
    </CarouselInner>
  )
}