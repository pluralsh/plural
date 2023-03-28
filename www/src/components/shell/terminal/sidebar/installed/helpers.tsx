import {
  AppMenuAction,
  AppProps,
  ArrowTopRightIcon,
  Button,
  Chip,
  LifePreserverIcon,
  ReloadIcon,
  Tooltip,
  TrashCanIcon,
  WrapWithIf,
} from '@pluralsh/design-system'
import { Flex } from 'honorable'
import { Dispatch, useState } from 'react'

import { Repository, RepositoryEdge } from '../../../../../generated/graphql'

import { LaunchAppModal, useLaunchAppModal } from './LaunchAppModal'

const PROMOTED_APPS = ['console']

function Status({ app }) {
  if (!app) return null

  const { ready, componentsReady } = app
  const pending = componentsReady ? `${componentsReady} Ready` : 'Pending'
  const text = ready ? 'Ready' : pending

  return (
    <Chip
      size="small"
      severity={ready ? 'success' : 'warning'}
    >{text}
    </Chip>
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
    ) : <Status app={app} />,
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
