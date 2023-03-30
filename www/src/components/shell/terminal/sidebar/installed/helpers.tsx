import {
  AppMenuAction,
  AppProps,
  ArrowTopRightIcon,
  Button,
  Chip,
  LifePreserverIcon,
  ListBoxItem,
  ReloadIcon,
  Tooltip,
  TrashCanIcon,
  WrapWithIf,
} from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import { Drop } from 'grommet'
import {
  Dispatch,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Repository, RepositoryEdge } from '../../../../../generated/graphql'

import { LaunchAppModal, useLaunchAppModal } from './LaunchAppModal'

const PROMOTED_APPS = ['console']

function StatusIndicator({ ready }) {
  return (
    <Div
      width={10}
      height={10}
      borderRadius="50%"
      backgroundColor={ready ? 'success' : 'warning'}
    />
  )
}

const ORDER = {
  deployment: 1,
  statefulset: 2,
  certificate: 3,
  ingress: 4,
  cronjob: 5,
  service: 6,
  job: 7,
}

const kindInd = kind => ORDER[kind.toLowerCase()] || 7

function orderBy({ kind: k1, name: n1, status: s1 }, { kind: k2, name: n2, status: s2 }) {
  if (s1 !== s2) return s1 > s2 ? 1 : -1 // Ready > Pending, and all ready comps should follow pending ones
  if (k1 === k2) return (n1 > n2) ? 1 : ((n1 === n2) ? 0 : -1)

  return kindInd(k1) - kindInd(k2)
}

function ComponentStatuses({ components }) {
  const name = ({ group, kind, name }) => `${group || 'v1'}/${kind.toLowerCase()} ${name}`
  const sorted = useMemo(() => components.sort(orderBy), [components])

  return (
    <Flex direction="column">
      {sorted.map(comp => (
        <ListBoxItem
          key={name(comp)}
          textValue={name(comp)}
          leftContent={<StatusIndicator ready={comp.status === 'Ready'} />}
          label={name(comp)}
        />
      ))}
    </Flex>
  )
}

function Status({ app }) {
  const ref = useRef()
  const [open, setOpen] = useState(false)

  if (!app) return null

  const { ready, componentsReady } = app
  const pending = componentsReady ? `${componentsReady} Ready` : 'Pending'
  const text = ready ? 'Ready' : pending

  return (
    <>
      <Chip
        ref={ref}
        cursor="pointer"
        size="small"
        whiteSpace="nowrap"
        onClick={() => setOpen(true)}
        severity={ready ? 'success' : 'warning'}
      >{text}
      </Chip>
      {open && (
        <Drop
          target={ref.current}
          align={{ top: 'bottom' }}
          onClickOutside={() => setOpen(false)}
        >
          <ComponentStatuses components={app.components} />
        </Drop>
      )}
    </>
  )
}

const toAppProps = ({ node: repository }: RepositoryEdge, appInfo: any, onAction: Dispatch<string>): AppProps => {
  const app = appInfo[repository!.name]
  const domain = app?.spec?.links?.length > 0 ? app.spec?.links[0].url : null
  const isAlive = !!repository!.installation?.pingedAt
  const promoted = PROMOTED_APPS.includes(repository!.name)

  return {
    isAlive,
    promoted,
    name: repository!.name,
    logoUrl: repository!.icon ?? repository!.darkIcon ?? undefined,
    description: repository!.description ?? '',
    primaryAction: domain ? (
      <PrimaryActionButton
        isAlive={isAlive}
        promoted={promoted}
        domain={domain}
        app={app}
        name={repository!.name}
      />
    ) : undefined,
    actions: toActions(repository!, onAction),
  }
}

const toActions = (repository: Repository, onAction: Dispatch<string>): Array<AppMenuAction> => {
  const rebuildCommand = `plural build --only ${repository.name} && plural deploy --from ${repository.name} --commit "rebuilding ${repository.name}"`
  const deleteCommand = `plural destroy ${repository.name}`
  const watchCommand = `plural watch ${repository.name}`

  return [
    { label: 'Rebuild', onSelect: () => onAction(rebuildCommand), leftContent: <ReloadIcon /> },
    { label: 'Check Health', onSelect: () => onAction(watchCommand), leftContent: <LifePreserverIcon /> },
    {
      label: 'Delete', onSelect: () => onAction(deleteCommand), destructive: true, leftContent: <TrashCanIcon color="text-danger" />,
    },
  ]
}

function PrimaryActionButton({
  name, domain, promoted, isAlive, app,
}): JSX.Element {
  const [visible, setVisible] = useState(false)
  const { shown } = useLaunchAppModal()

  return (
    <Flex
      direction="row"
      gap="xsmall"
    >
      {!shown && visible && (
        <LaunchAppModal
          setVisible={setVisible}
          name={name}
          domain={domain}
        />
      )}
      <Status app={app} />
      <WrapWithIf
        condition={!isAlive}
        wrapper={<Tooltip label="Application not ready" />}
      >
        <div>
          <Button
            minHeight={32}
            height={32}
            secondary={!promoted}
            disabled={!isAlive}
            onClick={() => !shown && setVisible(true)}
            {...(isAlive && shown && {
              as: 'a',
              href: `https://${domain}`,
              target: '_blank',
              rel: 'noopener noreferer',
            })}
          >
            <div className="app-launch-btn">Launch</div>
            <ArrowTopRightIcon />
          </Button>
        </div>
      </WrapWithIf>
    </Flex>
  )
}

export { toAppProps }
