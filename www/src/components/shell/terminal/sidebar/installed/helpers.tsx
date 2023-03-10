import {
  AppMenuAction,
  AppProps,
  ArrowTopRightIcon,
  Button,
  ReloadIcon,
  Tooltip,
  TrashCanIcon,
  WrapWithIf,
} from '@pluralsh/design-system'
import { Dispatch, useState } from 'react'

import { Repository, RepositoryEdge, ShellConfiguration } from '../../../../../generated/graphql'

import { LaunchAppModal, useLaunchAppModal } from './LaunchAppModal'

const PROMOTED_APPS = ['console']

const toAppProps = ({ node: repository }: RepositoryEdge, configuration: ShellConfiguration, onAction: Dispatch<string>): AppProps => {
  const domain = lookupApplicationDomain(repository!.name, configuration)
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
        name={repository!.name}
      />
    ) : undefined,
    actions: toActions(repository!, onAction),
  }
}

const lookupApplicationDomain = (name: string, configuration: ShellConfiguration): string | undefined => {
  const context = configuration?.contextConfiguration?.[name]
  const domains = configuration?.domains

  if (!context || !domains) return undefined

  const domain = Object.values(context).find(v => domains.includes(v?.toString() ?? '')) as string

  if (!domain) return undefined

  return domain
}

const toActions = (repository: Repository, onAction: Dispatch<string>): Array<AppMenuAction> => {
  const rebuildCommand = `plural build --only ${repository.name} && plural deploy --from ${repository.name} --commit "rebuilding ${repository.name}"`
  const deleteCommand = `plural destroy ${repository.name}`

  return [
    { label: 'Rebuild', onSelect: () => onAction(rebuildCommand), leftContent: <ReloadIcon /> },
    {
      label: 'Delete', onSelect: () => onAction(deleteCommand), destructive: true, leftContent: <TrashCanIcon color="text-danger" />,
    },
  ]
}

function PrimaryActionButton({
  name, domain, promoted, isAlive,
}): JSX.Element {
  const [visible, setVisible] = useState(false)
  const { shown } = useLaunchAppModal()

  return (
    <>
      {!shown && visible && (
        <LaunchAppModal
          setVisible={setVisible}
          name={name}
          domain={domain}
        />
      )}
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
    </>
  )
}

export { toAppProps }
