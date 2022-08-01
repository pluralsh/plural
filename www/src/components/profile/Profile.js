import { useMutation } from '@apollo/client'
import { Box, Stack, ThemeContext } from 'grommet'
import {
  Avatar, Flex, P,
} from 'honorable'
import {
  Button, ContentCard, IconFrame, PageTitle, ValidatedInput,
} from 'pluralsh-design-system'
import { useContext, useEffect, useState } from 'react'
import { useFilePicker } from 'react-sage'

import { CurrentUserContext } from '../login/CurrentUser'
import { UPDATE_USER } from '../users/queries'
import { DEFAULT_CHART_ICON, DarkProviderIcons, ProviderIcons } from '../repos/constants'

function Attribute({ header, children }) {
  return (
    <Box
      gap="small"
      basis="1/2"
    >
      <P fontWeight="bold">{header}</P>
      <Box
        direction="row"
        gap="small"
        align="end"
      >
        {children}
      </Box>
    </Box>
  )
}

export function Profile() {
  const { files, onClick, HiddenFileInput } = useFilePicker({})
  const me = useContext(CurrentUserContext)
  const { dark } = useContext(ThemeContext)
  const [name, setName] = useState(me.name)
  const [email, setEmail] = useState(me.email)
  const [mutation, { loading }] = useMutation(UPDATE_USER, {
    variables: { attributes: { name, email } },
  })

  let url = ProviderIcons[me.provider] || DEFAULT_CHART_ICON

  if (dark && DarkProviderIcons[me.provider]) {
    url = DarkProviderIcons[me.provider]
  }

  useEffect(() => {
    if (files.length > 0) {
      mutation({ variables: { attributes: { avatar: files[0] } } })
    }
  }, [files, mutation])

  return (
    <Box fill>
      <PageTitle heading="Profile" />
      <ContentCard>
        <Box
          gap="large"
          margin={{ bottom: 'medium' }}
          direction="row"
        >
          <Attribute header="Profile picture">
            <Stack
              anchor="bottom-right"
              style={{ height: '96px', width: '96px' }}
            >
              <Avatar
                name={me.name}
                src={me.avatar}
                size={96}
                fontSize="24px"
                fontWeight="500"
              />
            </Stack>
            <Box gap="xsmall">
              <Button
                small
                secondary
                onClick={onClick}
              >
                {me.avatar ? 'Switch' : 'Upload'}
              </Button>
              {!!me.avatar && (
                <Button
                  small
                  destructive
                  onClick={() => mutation({ variables: { attributes: { avatar: null } } })}
                >
                  Delete
                </Button>
              )}
            </Box>

            <HiddenFileInput
              accept=".jpg, .jpeg, .png"
              multiple={false}
            />
          </Attribute>
          {me.provider && (
            <Attribute header="Provider">
              <IconFrame
                url={url}
                alt={me.provider}
              />
            </Attribute>
          )}
        </Box>
        <Box gap="small">
          <ValidatedInput
            label="Full name"
            width="100%"
            value={name}
            onChange={({ target: { value } }) => setName(value)}
          />
          <ValidatedInput
            label="Email address"
            width="100%"
            value={email}
            onChange={({ target: { value } }) => setEmail(value)}
          />
        </Box>
        <Flex
          justifyContent="flex-end"
          marginTop="small"
        >
          <Button
            onClick={mutation}
            loading={loading}
          >
            Save
          </Button>
        </Flex>
      </ContentCard>
    </Box>
  )
}
