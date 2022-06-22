import { useMutation } from '@apollo/client'
import { Box, Stack } from 'grommet'
import { Avatar, Button, Div, P } from 'honorable'
import { DownloadIcon, ValidatedInput } from 'pluralsh-design-system'
import { useContext, useEffect, useState } from 'react'
import { useFilePicker } from 'react-sage'

import { CurrentUserContext } from '../login/CurrentUser'
import { Provider } from '../repos/misc'
import { UPDATE_USER } from '../users/queries'

import { Header } from './Header'

function Attribute({ header, children }) {
  return (
    <Box gap="small">
      <P fontWeight="bold">{header}</P>
      {children}
    </Box>
  )
}

export function Me() {
  const { files, onClick, HiddenFileInput } = useFilePicker({})
  const me = useContext(CurrentUserContext)
  const [name, setName] = useState(me.name)
  const [email, setEmail] = useState(me.email)
  const [mutation, { loading }] = useMutation(UPDATE_USER, {
    variables: { attributes: { name, email } },
  })

  useEffect(() => {
    if (files.length > 0) {
      mutation({ variables: { attributes: { avatar: files[0] } } })
    }
  }, [files, mutation])

  return (

    <Box
      gap="medium"
      fill
    >
      <Header
        header="Profile"
        description="Edit how your profile appears to other users"
      />
      <Box
        gap="large"
        direction="row"
      >
        <Attribute header="Profile Picture">
          <Stack
            anchor="bottom-right"
            style={{ width: '100px' }}
          >
            <Avatar
              name={me.name}
              src={me.avatar}
              size={100}
            />
            <>
              <Box
                flex={false}
                round="full"
                align="center"
                justify="center"
                background="#222534"
                pad="small"
                onClick={onClick}
              >
                <DownloadIcon size={15} />
              </Box>
              <HiddenFileInput
                accept=".jpg, .jpeg, .png"
                multiple={false}
              />
            </>
          </Stack>
        </Attribute>
        {me.provider && (
          <Attribute header="Provider">
            <Provider
              provider={me.provider}
              width={75}
            />
          </Attribute>
        )}
      </Box>
      <Box gap="small">
        <ValidatedInput
          label="Name"
          width="70%"
          value={name}
          onChange={({ target: { value } }) => setName(value)}
          validation={() => null}
        />
        <ValidatedInput
          label="Email"
          width={500}
          value={email}
          hint="Changing emails will require email verification"
          onChange={({ target: { value } }) => setEmail(value)}
          validation={() => null}
        />
      </Box>
      <Div>
        <Button
          width="90px"
          onClick={mutation}
          loading={loading}
        >
          Save
        </Button>
      </Div>
    </Box>
  )
}
