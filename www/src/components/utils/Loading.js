import React from 'react'
import {Box} from 'grommet'
import {HashLoader} from 'react-spinners'

function Loading(props) {
  return (
    <Box
      height={props.height || "100%"}
      width={props.width}
      direction='column'
      justify='center'
      align='center'>
      <HashLoader size={50} />
    </Box>
  )
}

export default Loading