import React, {useContext, useEffect, useState} from 'react'
import {useMutation} from 'react-apollo'
import {Box} from 'grommet'
import Repositories from '../repos/Repositories'
import CreateRepository from '../repos/CreateRepository'
import {CurrentUserContext} from '../login/CurrentUser'
import {BreadcrumbContext} from '../Chartmart'
import Expander from '../utils/Expander'
import { EDIT_PUBLISHER } from './queries'
import { ME_Q } from '../users/queries'
import InputField from '../utils/InputField'
import Button from '../utils/Button'

function EditPublisher({description}) {
  const [attributes, setAttributes] = useState({description})
  const [mutation] = useMutation(EDIT_PUBLISHER, {
    variables: {attributes},
    update: (cache, { data: { updatePublisher } }) => {
      const prev = cache.readQuery({ query: ME_Q })
      cache.writeQuery({query: ME_Q, data: {
        ...prev, me: {
          ...prev.me,
          publisher: updatePublisher
        }
      }})
    }
  })

  return (
    <Box gap='small' pad='small'>
      <InputField
        label='description'
        labelWidth='85px'
        value={attributes.description}
        onChange={(e) => setAttributes({...attributes, description: e.target.value})} />
      <Box direction='row' justify='end'>
        <Button round='xsmall' label='Update' onClick={mutation} />
      </Box>
    </Box>
  )
}

function MyPublisher() {
  const me = useContext(CurrentUserContext)
  const {setBreadcrumbs} = useContext(BreadcrumbContext)
  useEffect(() => {
    if (!me.publisher) return
    setBreadcrumbs([{url: `/publishers/${me.publisher.id}`, text: me.publisher.name}])
  }, [me, setBreadcrumbs])

  return (
    <Box direction='row' pad='medium'>
      <Box width='60%'>
        <Repositories publisher={me.publisher} deletable />
      </Box>
      <Box width='40%'>
        <Box elevation='small'>
          <Expander text='Edit publisher'>
            <EditPublisher {...me.publisher} />
          </Expander>
          <Box border='top'>
            <Expander text='Create Repository' open>
              <CreateRepository publisher={me.publisher} />
            </Expander>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default MyPublisher