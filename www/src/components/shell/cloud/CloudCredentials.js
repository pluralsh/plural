import { createElement, useCallback, useContext, useRef, useState } from 'react'
import { Down } from 'grommet-icons'
import { Box, Drop } from 'grommet'
import { Text } from 'honorable'

import { Provider } from '../../repos/misc'
import { CLOUDS } from '../constants'
import { CreateShellContext, Header } from '../CloudShell'

import { CloudItem, ProviderForms } from './provider'

export function CloudCredentials() {
  const { provider, setProvider, workspace, setWorkspace, credentials, setCredentials } = useContext(CreateShellContext)

  const ref = useRef()
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [setOpen])
  const form = ProviderForms[provider]

  return (
    <>
      <Box
        fill
        align="center"
        justify="center"
        gap="small"
      >
        <Header text="Cloud Credentialss" />
        <Box
          ref={ref}
          direction="row"
          align="center"
          gap="small"
          onClick={() => setOpen(true)}
          hoverIndicator="card"
          round="xsmall"
          pad="small"
        >
          <Text
            size="small"
            weight={500}
          >
            Provider
          </Text>
          <Provider
            provider={provider}
            width={40}
          />
          <Down size="small" />
        </Box>
        {createElement(form, { workspace, setWorkspace, credentials, setCredentials })}
      </Box>
      {open && (
        <Drop
          target={ref.current}
          onClickOutside={close}
          onEsc={close}
        >
          <Box width="250px">
            {CLOUDS.map(cloud => (
              <CloudItem
                provider={cloud}
                setProvider={setProvider}
              />
            ))}
          </Box>
        </Drop>
      )}
    </>
  )
}
