import { useTheme } from 'styled-components'
import { Dispatch } from 'react'
import {
  Button,
  DiscordIcon,
  DocumentIcon,
  IconFrame,
  LifePreserverIcon,
  Sidebar,
  SidebarItem,
  SidebarSection,
} from '@pluralsh/design-system'

import { OnboardingLogo } from './OnboardingLogo'

interface OnboardingHeaderProps {
  onRestart?: Dispatch<void>
}

function OnboardingHeader({ onRestart }: OnboardingHeaderProps) {
  const theme = useTheme()

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
          href=""
        >
          <IconFrame
            textValue="Support"
            type="secondary"
            icon={<LifePreserverIcon />}
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
        {onRestart && (
          <SidebarItem>
            <Button
              small
              secondary
              onClick={onRestart}
            >Restart onboarding
            </Button>
          </SidebarItem>
        )}
      </SidebarSection>
    </Sidebar>
  )
}

export default OnboardingHeader
