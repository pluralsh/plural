import React from 'react'
import {Box} from 'grommet'
import Repositories from '../repos/Repositories'
import CreateRepository from '../repos/CreateRepository'
import {CurrentUserContext} from '../login/CurrentUser'

function MyPublisher(props) {
  return (
    <CurrentUserContext.Consumer>
    {me => (
      <Box height='100%' direction='row' pad='medium'>
        <Box height='100%' width='60%' border='right'>
          <Repositories publisher={me.publisher} deletable />
        </Box>
        <Box height='100%' width='40%'>
          <CreateRepository publisher={me.publisher} />
        </Box>
      </Box>
    )}
    </CurrentUserContext.Consumer>
  )
}

export default MyPublisher