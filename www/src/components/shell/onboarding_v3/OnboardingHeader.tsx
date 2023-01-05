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
import { useTheme } from 'styled-components'

import { OnboardingLogo } from './OnboardingLogo'

function OnboardingHeader({ onRestart }) {
  const theme = useTheme()

  return (
    <Sidebar
      layout="horizontal"
      background={theme.colors['fill-one']}
      grow={0}
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
          tooltip="Documentation"
          href=""
        >
          <IconFrame
            textValue="Documentation"
            type="secondary"
            icon={<LifePreserverIcon />}
          />
        </SidebarItem>
        <SidebarItem
          clickable
          tooltip=""
          href=""
        >
          <IconFrame
            textValue=""
            type="secondary"
            icon={<DocumentIcon />}
          />
        </SidebarItem>
        <SidebarItem>
          <Button
            small
            secondary
            onClick={onRestart}
          >Restart onboarding
          </Button>
        </SidebarItem>
      </SidebarSection>
    </Sidebar>
  )
}

export default OnboardingHeader
