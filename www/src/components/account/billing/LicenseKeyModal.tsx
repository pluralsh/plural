import {
  Button,
  CheckIcon,
  EyeClosedIcon,
  EyeIcon,
  Flex,
  IconFrame,
  Input,
  Modal,
} from '@pluralsh/design-system'
import { useCopy } from 'hooks/useCopy'
import { ComponentPropsWithoutRef, useState } from 'react'
import { useTheme } from 'styled-components'

export function LicenseKeyModal({
  licenseKey,
  onOpenChange,
  ...props
}: ComponentPropsWithoutRef<typeof Modal> & { licenseKey: string }) {
  const {
    partials: { text },
    spacing,
  } = useTheme()
  const [showKey, setShowKey] = useState(false)
  const { copied, handleCopy } = useCopy(licenseKey, 2000)

  return (
    <Modal
      header="Generate License Key"
      onOpenChange={onOpenChange}
      actions={
        <Flex gap="medium">
          <Button
            secondary
            onClick={() => onOpenChange?.(false)}
          >
            Close
          </Button>
          {licenseKey && (
            <Button
              width={160}
              disabled={copied}
              onClick={copied ? undefined : handleCopy}
              endIcon={copied ? <CheckIcon /> : undefined}
            >
              {copied ? 'Copied' : 'Copy license key'}
            </Button>
          )}
        </Flex>
      }
      {...props}
    >
      <Flex
        direction="column"
        gap="xsmall"
      >
        <span css={text.body2Bold}>License key</span>
        <Input
          type={showKey ? 'text' : 'password'}
          caretColor="transparent"
          endIcon={
            <IconFrame
              padding={0}
              clickable
              onClick={() => setShowKey(!showKey)}
              tooltip={showKey ? 'Hide' : 'Show'}
              icon={showKey ? <EyeClosedIcon /> : <EyeIcon />}
            />
          }
          value={licenseKey}
        />
      </Flex>
    </Modal>
  )
}
