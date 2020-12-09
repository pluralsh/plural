import React, { useContext, useState } from 'react'
import { Box } from 'grommet'
import { SIDEBAR_WIDTH } from '../constants'
import { SectionChoice } from '../utils/SectionChoice'
import { useHistory, useParams } from 'react-router'
import { Edit, Group, User } from 'grommet-icons'
import { useMutation } from 'react-apollo'
import { UPDATE_ACCOUNT } from './queries'
import { Button, InputCollection, ResponsiveInput } from 'forge-core'
import { EditHeader } from '../users/EditUser'
import { CurrentUserContext } from '../login/CurrentUser'
import { Groups, Users } from './Directory'

const ICON_SIZE = '12px'

const ViewOptions = {
  EDIT: 'attributes',
  USERS: 'users',
  GROUPS: 'groups',
}

const VIEWS = [
  {text: 'Edit Attributes', view: ViewOptions.EDIT, icon: <Edit size={ICON_SIZE} />},
  {text: "Users", view: ViewOptions.USERS, icon: <User size={ICON_SIZE} />},
  {text: "Groups", view: ViewOptions.GROUPS, icon: <Group size={ICON_SIZE} />}
]

function EditAttributes() {
  const {account} = useContext(CurrentUserContext)
  const [attributes, setAttributes] = useState({name: account.name})
  const [mutation, {loading}] = useMutation(UPDATE_ACCOUNT, {variables: {attributes}})

  return (
    <Box fill pad={{horizontal: 'small', vertical: 'medium'}} gap='xsmall'>
      <EditHeader text='Edit Attributes' />
      <InputCollection>
        <ResponsiveInput
          value={attributes.name}
          label='name'
          onChange={({target: {value}}) => setAttributes({...attributes, name: value})} />
      </InputCollection>
      <Box direction='row' justify='end'>
        <Button label='Update' loading={loading} onClick={mutation} />
      </Box>
    </Box>
  )
}

export function EditAccount() {
  let history = useHistory()
  const {section} = useParams()

  return (
    <Box fill direction='row'>
      <Box gap='xsmall' flex={false} width={SIDEBAR_WIDTH} height='100%'
           border={{side: 'right', color: 'light-3'}} pad='small'>
        {VIEWS.map(({text, view, icon}) => (
          <SectionChoice
            selected={section === view}
            label={text}
            icon={icon}
            onClick={() => history.push(`/accounts/edit/${view}`)} />
        ))}
      </Box>
      <Box fill>
        {section === ViewOptions.EDIT && <EditAttributes />}
        {section === ViewOptions.USERS && <Users />}
        {section === ViewOptions.GROUPS && <Groups />}
      </Box>
    </Box>
  )
}