import React, {useContext, useEffect} from 'react'
import {Box} from 'grommet'
import Repositories from '../repos/Repositories'
import CreateRepository from '../repos/CreateRepository'
import {CurrentUserContext} from '../login/CurrentUser'
import {BreadcrumbContext} from '../Chartmart'

function MyPublisher() {
  const me = useContext(CurrentUserContext)
  const {setBreadcrumbs} = useContext(BreadcrumbContext)
  useEffect(() => {
    if (!me.publisher) return
    setBreadcrumbs([{url: `/publishers/${me.publisher.id}`, text: me.publisher.name}])
  }, [me, setBreadcrumbs])

  return (
    <Box height='100%' direction='row' pad='medium'>
      <Box height='100%' width='60%' border='right'>
        <Repositories publisher={me.publisher} deletable />
      </Box>
      <Box height='100%' width='40%'>
        <CreateRepository publisher={me.publisher} />
      </Box>
    </Box>
  )
}

export default MyPublisher