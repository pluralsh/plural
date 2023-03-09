import styled from 'styled-components'
import {
  AppsIcon,
  Button,
  InstallIcon,
  Tooltip,
  WrapWithIf,
} from '@pluralsh/design-system'
import {
  Dispatch,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useQuery } from '@apollo/client'
import { useSearchParams } from 'react-router-dom'

import { State, TerminalContext } from '../context/terminal'

import Installer from './installer/Installer'
import { Installed } from './installed/Installed'
import { APPLICATIONS_QUERY } from './installer/queries'

enum SidebarView {
  Installer = 'installer',
  Installed = 'installed',
}

interface HeaderProps {
  view: SidebarView
  onViewChange: Dispatch<SidebarView>
  disabled: boolean
}

const Header = styled(HeaderUnstyled)(({ theme }) => ({
  height: '48px',
  minHeight: '48px',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  '.title': {
    ...theme.partials.text.subtitle2,
  },
}))

function HeaderUnstyled({
  view, onViewChange, disabled = false, ...props
}: HeaderProps): JSX.Element {
  const title = useMemo(() => (view === SidebarView.Installer ? 'Install apps' : 'Installed apps'), [view])
  const buttonText = useMemo(() => (view === SidebarView.Installer ? 'View installed apps' : 'Install'), [view])
  const buttonIcon = useMemo(() => (view === SidebarView.Installer ? <AppsIcon /> : <InstallIcon />), [view])

  const changeView = useCallback(() => (view === SidebarView.Installer
    ? onViewChange(SidebarView.Installed)
    : onViewChange(SidebarView.Installer)), [onViewChange, view])

  return (
    <div {...props}>
      <div className="title">{title}</div>
      <WrapWithIf
        condition={disabled}
        wrapper={<Tooltip label="No apps installed yet." />}
      >
        <div>
          <Button
            height={32}
            minHeight={32}
            secondary
            floating={!disabled}
            startIcon={buttonIcon}
            onClick={changeView}
            disabled={disabled}
          >{buttonText}
          </Button>
        </div>
      </WrapWithIf>
    </div>
  )
}

const Sidebar = styled(SidebarUnstyled)(({ theme }) => ({
  height: '100%',
  overflow: 'hidden',
  padding: theme.spacing.medium,
  borderRight: theme.borders.default,
}))

function SidebarUnstyled({ refetch, ...props }) {
  const { shell: { provider }, state } = useContext(TerminalContext)
  const [view, setView] = useState(SidebarView.Installer)
  const [searchParams] = useSearchParams()

  const { data: { repositories: { edges: nodes } = { edges: [] } } = {} } = useQuery(APPLICATIONS_QUERY,
    {
      variables: { provider, installed: true },
      skip: !provider,
      fetchPolicy: 'network-only',
    })

  const hasInstalledApps = useMemo(() => nodes?.length > 0, [nodes?.length])
  const hasPreselectedApp = useMemo(() => !!searchParams.get('install'), [searchParams])

  useEffect(() => (hasInstalledApps ? setView(SidebarView.Installed) : undefined), [hasInstalledApps])
  useEffect(() => (hasPreselectedApp ? setView(SidebarView.Installer) : undefined), [hasPreselectedApp])
  useEffect(() => (state === State.Installed ? setView(SidebarView.Installed) : undefined), [state])

  return (
    <div {...props}>
      <Header
        view={view}
        onViewChange={view => setView(view)}
        disabled={view === SidebarView.Installer && !hasInstalledApps}
      />
      {view === SidebarView.Installed && <Installed />}
      {view === SidebarView.Installer && <Installer onInstallSuccess={() => refetch()} />}
    </div>
  )
}

export { Sidebar }
