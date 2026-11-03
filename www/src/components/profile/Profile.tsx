import { useMutation } from '@apollo/client'
import {
  AppIcon,
  Button,
  Chip,
  Flex,
  ValidatedInput,
} from '@pluralsh/design-system'
import { ChangeEvent, ReactNode, useContext, useRef, useState } from 'react'
import styled, { useTheme } from 'styled-components'

import CurrentUserContext from '../../contexts/CurrentUserContext'
import { UPDATE_USER } from '../users/queries'
import { SubpageCard, SubpageHeader } from '../utils/layout/SubpageLayout'
import { getProviderIconUrl } from '../utils/ProviderIcon'
import { Body2BoldP } from '../utils/Typography'

function Attribute({
  header,
  children,
}: {
  header: string
  children: ReactNode
}) {
  return (
    <Flex
      direction="column"
      gap="small"
    >
      <Body2BoldP>{header}</Body2BoldP>
      <Flex
        direction="row"
        gap="small"
        align="end"
      >
        {children}
      </Flex>
    </Flex>
  )
}

export function Profile() {
  const theme = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const me = useContext(CurrentUserContext)
  const [name, setName] = useState(me.name)
  const [email, setEmail] = useState(me.email)
  const [avatar, setAvatar] = useState(me.avatar)
  const [avatarFile, setAvatarFile] = useState<File | null>()
  const [mutation, { loading }] = useMutation(UPDATE_USER, {
    variables: { attributes: { name, email, avatar: avatarFile } },
  })

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      setAvatar(URL.createObjectURL(file))
      setAvatarFile(file)
    }
  }

  return (
    <ProfileSC>
      <SubpageHeader title="Profile" />
      <SubpageCard>
        <Flex
          gap="xlarge"
          direction="row"
        >
          <Attribute header="Profile picture">
            <AppIcon
              name={name}
              url={avatar}
              spacing={avatar ? 'none' : undefined}
              size="medium"
            />
            <Flex
              direction="column"
              gap="xsmall"
            >
              <Button
                small
                secondary
                onClick={() => fileInputRef.current?.click()}
              >
                {avatar ? 'Switch' : 'Upload'}
              </Button>
              {!!avatar && (
                <Button
                  small
                  destructive
                  onClick={() => {
                    setAvatar(null)
                    setAvatarFile(null)
                  }}
                >
                  Delete
                </Button>
              )}
            </Flex>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg, .jpeg, .png"
              css={{ display: 'none' }}
              onChange={onFileChange}
            />
          </Attribute>
          {me.provider && (
            <Attribute header="Provider">
              <AppIcon
                url={getProviderIconUrl(me.provider, theme.mode)}
                alt={me.provider}
              />
            </Attribute>
          )}
        </Flex>
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
          endIcon={
            me.emailConfirmed ? null : (
              <Chip size="small">Pending verification</Chip>
            )
          }
        />
        <Button
          onClick={() => mutation()}
          loading={loading}
        >
          Save
        </Button>
      </SubpageCard>
    </ProfileSC>
  )
}

const ProfileSC = styled.div(({ theme }) => ({
  paddingBottom: theme.spacing.large,
}))
