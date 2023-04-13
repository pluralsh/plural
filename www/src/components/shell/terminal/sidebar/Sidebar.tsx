import styled from 'styled-components'
import {
  AppsIcon,
  Button,
  ClusterIcon,
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
import { Div, Flex } from 'honorable'

import { Cluster } from '../../../../generated/graphql'
import ClustersContext from '../../../../contexts/ClustersContext'
import { ClusterPicker } from '../../../utils/ClusterPicker'

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
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing.medium,
  minHeight: '48px',
  flexShrink: 0,
  paddingBottom: theme.spacing.small,
  '.titleArea': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
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
      <ClusterSelect />
      <div className="titleArea">
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
    </div>
  )
}

const Sidebar = styled(SidebarUnstyled)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  padding: theme.spacing.medium,
  borderRight: theme.borders.default,
}))

function useSelectCluster() {
  const [params, setSearchParams] = useSearchParams()
  const { clusters } = useContext(ClustersContext)
  const clusterId = params.get('cluster')

  const currentCluster = useMemo(() => (clusterId ? clusters.find(cl => cl.id === clusterId) : undefined), [clusterId, clusters])

  if (!currentCluster && clusterId) {
    setSearchParams(sp => {
      sp.delete('cluster')

      return sp
    })
  }
  const setCluster = useCallback((cluster?: Cluster) => {
    if (clusters.some(cl => cl.id === cluster?.id)) {
      setSearchParams(sp => {
        if (cluster?.id) {
          sp.set('cluster', cluster?.id)
        }
        else {
          sp.delete('cluster')
        }

        return sp
      })
    }
  }, [clusters, setSearchParams])

  return {
    cluster: currentCluster,
    setCluster,
    clusters,
  }
}

function ClusterSelect() {
  const { cluster, setCluster, clusters } = useSelectCluster()

  if (!clusters || clusters.length < 2) {
    return null
  }

  return (
    <ClusterPicker
      cluster={cluster}
      setCluster={p => setCluster(p)}
      size="small"
      title={(
        <Flex
          gap="xsmall"
          whiteSpace="nowrap"
        >
          <ClusterIcon />
          Cluster
        </Flex>
      )}
    />
  )

  return null
}

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

  useEffect(() => (hasPreselectedApp
    ? setView(SidebarView.Installer)
    : hasInstalledApps
      ? setView(SidebarView.Installed)
      : undefined),
  [hasInstalledApps, hasPreselectedApp])
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
