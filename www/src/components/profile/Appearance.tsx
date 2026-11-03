import {
  BrowserIcon,
  ListBoxItem,
  MoonIcon,
  Select,
  SunIcon,
} from '@pluralsh/design-system'
import { ReactNode } from 'react'
import styled from 'styled-components'

import { SubpageCard, SubpageHeader } from '../utils/layout/SubpageLayout'
import { Body2BoldP, Body2P } from '../utils/Typography'

import { ThemePreference, useThemePreference } from './themePreference'

const THEME_OPTIONS: Record<
  ThemePreference,
  { label: string; icon: ReactNode }
> = {
  dark: { label: 'Dark', icon: <MoonIcon size={16} /> },
  light: { label: 'Light', icon: <SunIcon size={16} /> },
  system: { label: 'System', icon: <BrowserIcon size={16} /> },
}

export function Appearance() {
  const [preference, setPreference] = useThemePreference()

  return (
    <AppearanceSC>
      <SubpageHeader title="Appearance" />
      <SettingRowSC>
        <div>
          <Body2BoldP>Interface theme</Body2BoldP>
          <Body2P $color="text-light">
            Customize your interface color. You can also press Shift+T to
            toggle.
          </Body2P>
        </div>
        <div className="control">
          <Select
            label="Theme"
            selectedKey={preference}
            leftContent={THEME_OPTIONS[preference].icon}
            onSelectionChange={(key) => setPreference(key as ThemePreference)}
          >
            {Object.entries(THEME_OPTIONS).map(([key, { label, icon }]) => (
              <ListBoxItem
                key={key}
                label={label}
                leftContent={icon}
              />
            ))}
          </Select>
        </div>
      </SettingRowSC>
    </AppearanceSC>
  )
}

const AppearanceSC = styled.div(({ theme }) => ({
  paddingBottom: theme.spacing.large,
}))

const SettingRowSC = styled(SubpageCard)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing.large,
  '.control': {
    width: 200,
    flexShrink: 0,
  },
}))
