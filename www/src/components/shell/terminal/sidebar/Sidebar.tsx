import { useQuery } from '@apollo/client'
import {
  AppsIcon,
  Button,
  ClusterIcon,
  InstallIcon,
  Tooltip,
  WrapWithIf,
} from '@pluralsh/design-system'
import { Flex } from 'honorable'
import {
  Dispatch,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useSearchParams } from 'react-router-dom'
import styled from 'styled-components'

import ClustersContext from '../../../../contexts/ClustersContext'
import { CloudShellClusterPicker } from '../../../utils/ClusterPicker'
import { ImpersonationContext } from '../../context/impersonation'

import { State, TerminalContext } from '../context/terminal'

import { CloudShell } from '../../../../generated/graphql'

import { Installed } from './installed/Installed'
import Installer from './installer/Installer'
import { APPLICATIONS_QUERY } from './installer/queries'

enum SidebarView {
  Installer = 'installer',
  Installed = 'installed',
}

interface HeaderProps {
  view: SidebarView
  shell: CloudShell
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
  view,
  shell,
  onViewChange,
  disabled = false,
  ...props
}: HeaderProps): JSX.Element {
  const title = useMemo(
    () => (view === SidebarView.Installer ? 'Install apps' : 'Installed apps'),
    [view]
  )
  const buttonText = useMemo(
    () => (view === SidebarView.Installer ? 'View installed apps' : 'Install'),
    [view]
  )
  const buttonIcon = useMemo(
    () => (view === SidebarView.Installer ? <AppsIcon /> : <InstallIcon />),
    [view]
  )

  const changeView = useCallback(
    () =>
      view === SidebarView.Installer
        ? onViewChange(SidebarView.Installed)
        : onViewChange(SidebarView.Installer),
    [onViewChange, view]
  )

  return (
    <div {...props}>
      <ClusterSelect shell={shell} />
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
            >
              {buttonText}
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

function useSelectCluster(shell?: CloudShell) {
  const [_, setSearchParams] = useSearchParams()
  const {
    user: { id: userId },
  } = useContext(ImpersonationContext)

  const { clusters: allClusters } = useContext(ClustersContext)
  const clusters = useMemo(
    () =>
      allClusters.filter(
        (c) =>
          c?.owner?.id !== userId ||
          !shell ||
          (c.name === shell.cluster && c.provider === shell.provider)
      ),
    [allClusters, shell, userId]
  )

  const currentCluster = useMemo(
    () => clusters.find((cl) => cl?.owner?.id === userId),
    [clusters, userId]
  )

  const setCluster = useCallback(
    (clusterId?: string) => {
      setSearchParams((sp) => {
        const cluster = clusters.find((cl) => cl.id === clusterId)

        if (cluster) {
          sp.set('user', cluster.owner!.id)
        } else {
          sp.delete('user')
        }

        return sp
      })
    },
    [clusters, setSearchParams]
  )

  return {
    cluster: currentCluster,
    setCluster,
    clusters,
  }
}

function ClusterSelect({ shell }) {
  const { cluster, setCluster, clusters } = useSelectCluster(shell)

  if (!clusters || clusters.length < 2) {
    return null
  }

  return (
    <CloudShellClusterPicker
      clusterId={cluster?.id}
      onChange={(id) => setCluster(id)}
      size="small"
      title={
        <Flex
          gap="xsmall"
          whiteSpace="nowrap"
        >
          <ClusterIcon />
          Cluster
        </Flex>
      }
    />
  )
}

function SidebarUnstyled({ refetch, ...props }) {
  const { shell, state } = useContext(TerminalContext)
  const [view, setView] = useState(SidebarView.Installer)
  const [searchParams] = useSearchParams()
  const { provider } = shell
  const { data: { repositories: { edges: nodes } = { edges: [] } } = {} } =
    useQuery(APPLICATIONS_QUERY, {
      variables: { provider, installed: true },
      skip: !provider,
      fetchPolicy: 'network-only',
    })

  const hasInstalledApps = useMemo(() => nodes?.length > 0, [nodes?.length])
  const hasPreselectedApp = useMemo(
    () => !!searchParams.get('install'),
    [searchParams]
  )

  useEffect(
    () =>
      hasPreselectedApp
        ? setView(SidebarView.Installer)
        : hasInstalledApps
        ? setView(SidebarView.Installed)
        : undefined,
    [hasInstalledApps, hasPreselectedApp]
  )
  useEffect(
    () =>
      state === State.Installed ? setView(SidebarView.Installed) : undefined,
    [state]
  )

  return (
    <div {...props}>
      <Header
        shell={shell}
        view={view}
        onViewChange={(view) => setView(view)}
        disabled={view === SidebarView.Installer && !hasInstalledApps}
      />
      {view === SidebarView.Installed && <Installed />}
      {view === SidebarView.Installer && (
        <Installer onInstallSuccess={() => refetch()} />
      )}
    </div>
  )
}

export { Sidebar, useSelectCluster }
