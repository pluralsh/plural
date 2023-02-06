import { useTheme } from 'styled-components'
import { Dispatch, useState } from 'react'
import {
  Button,
  DiscordIcon,
  DocumentIcon,
  GitHubLogoIcon,
  IconFrame,
  Modal,
  Sidebar,
  SidebarItem,
  SidebarSection,
} from '@pluralsh/design-system'

import { Flex, Span } from 'honorable'

import { OnboardingLogo } from './OnboardingLogo'
import { useSection } from './context/hooks'
import { SectionKey } from './context/types'

interface OnboardingHeaderProps {
  onRestart?: Dispatch<void>
}

function RestartModal({ onRestart, open, onClose }) {
  return (
    <Modal
      size="large"
      open={open}
      onClose={onClose}
      style={{ padding: 0 }}
    >
      <Flex
        direction="column"
        gap="large"
      >
        <Span
          body2
          color="text-xlight"
        >CONFIRM RESTART
        </Span>
        <Span body1>Are you sure you want to restart onboarding? You will lose all progress.</Span>
      </Flex>
      <Flex
        justify="flex-end"
        gap="medium"
        paddingTop="large"
      >
        <Button
          secondary
          onClick={onClose}
        >Cancel
        </Button>
        <Button
          destructive
          onClick={onRestart}
        >Confirm
        </Button>
      </Flex>
    </Modal>
  )
}

function OnboardingHeader({ onRestart }: OnboardingHeaderProps) {
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const { section } = useSection()

  return (
    <Sidebar
      layout="horizontal"
      background={theme.colors['fill-one']}
      maxHeight={56}
    >
      <SidebarSection
        grow={1}
        marginLeft="small"
      >
        <SidebarItem>
          <OnboardingLogo />
        </SidebarItem>
      </SidebarSection>
      <SidebarSection marginRight="small">
        <SidebarItem
          clickable
          tooltip="Discord"
          href="https://discord.com/invite/qsUfBcC3Ru"
        >
          <IconFrame
            textValue="Discord"
            type="secondary"
            icon={<DiscordIcon />}
          />
        </SidebarItem>
        <SidebarItem
          clickable
          tooltip="Support"
          href="https://github.com/pluralsh/plural"
        >
          <IconFrame
            textValue="Support"
            type="secondary"
            icon={<GitHubLogoIcon />}
          />
        </SidebarItem>
        <SidebarItem
          clickable
          tooltip="Documentation"
          href="https://docs.plural.sh/"
        >
          <IconFrame
            textValue="Documentation"
            type="secondary"
            icon={<DocumentIcon />}
          />
        </SidebarItem>
        <SidebarItem>
          <Button
            small
            secondary
            onClick={() => setOpen(true)}
            disabled={section.key === SectionKey.CREATE_REPOSITORY}
          >Restart onboarding
          </Button>
        </SidebarItem>
        <RestartModal
          onRestart={onRestart}
          open={open}
          onClose={() => setOpen(false)}
        />
      </SidebarSection>
    </Sidebar>
  )
}

export default OnboardingHeader
