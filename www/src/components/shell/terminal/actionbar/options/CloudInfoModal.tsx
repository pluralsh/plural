import { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { FormField, Input, Modal } from '@pluralsh/design-system'
import {
  A,
  Button,
  Flex,
  Span,
} from 'honorable'
import GitUrlParse from 'git-url-parse'

import { SHELL_CONFIGURATION_QUERY } from '../../queries'

function CloudInfoModal({ onClose }) {
  const [open, setOpen] = useState(true)
  const { data: { shellConfiguration } } = useQuery(SHELL_CONFIGURATION_QUERY)
  const [gitUrl, setGitUrl] = useState<{name: string, organization: string}>()

  const close = useCallback(() => {
    setOpen(false)
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!shellConfiguration) return

    setGitUrl(GitUrlParse(shellConfiguration.git.url))
  }, [shellConfiguration])

  return (
    <Modal
      size="large"
      open={open}
      onClose={close}
      style={{ padding: 0 }}
    >
      <Flex
        direction="column"
        gap="large"
      >
        <Span
          body2
          color="text-xlight"
        >CLOUD SHELL INFO
        </Span>
        <Span body1>The Plural-hosted cloud shell allows you to access your cluster’s git repository without syncing locally. </Span>
        <Flex
          direction="column"
          gap="medium"
        >
          <FormField
            label="GitHub organization"
            hint={(
              <Span
                caption
                color="text-xlight"
              >
                <A
                  inline
                  href="https://www.plural.sh/contact"
                  target="_blank"
                >Contact us
                </A>
                &nbsp;for support if you need to change the Git repo owner.
              </Span>
            )}
          >
            <Input
              placeholder="organization"
              value={gitUrl?.organization}
              disabled
            />
          </FormField>

          <FormField label="GitHub repo">
            <Input
              placeholder="repository"
              value={gitUrl?.name}
              disabled
            />
          </FormField>
        </Flex>
        <Flex justify="flex-end">
          <Button onClick={close}>Okay</Button>
        </Flex>
      </Flex>
    </Modal>
  )
}

export { CloudInfoModal }
