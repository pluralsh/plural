import {
  AppMenuAction,
  AppProps,
  ArrowTopRightIcon,
  Button,
  Tooltip,
  WrapWithIf,
} from '@pluralsh/design-system'
import { Dispatch } from 'react'

import { Repository, RepositoryEdge, ShellConfiguration } from '../../../../../generated/graphql'

const lookupApplicationDomain = (name: string, configuration: ShellConfiguration): string | undefined => {
  const context = configuration?.contextConfiguration?.[name]
  const domains = configuration?.domains

  if (!context || !domains) return undefined

  const domain = Object.values(context).find(v => domains.includes(v?.toString() ?? '')) as string

  if (!domain) return undefined

  return domain
}

const PROMOTED_APPS = ['console']

const toAppProps = ({ node: repository }: RepositoryEdge, configuration: ShellConfiguration, onAction: Dispatch<string>): AppProps => {
  const domain = lookupApplicationDomain(repository!.name, configuration)
  const isAlive = !!repository!.installation?.pingedAt
  const promoted = PROMOTED_APPS.includes(repository!.name)

  return {
    promoted,
    name: repository!.name,
    logoUrl: repository!.icon ?? repository!.darkIcon ?? undefined,
    description: repository!.description ?? '',
    primaryAction: domain ? (
      <PrimaryActionButton
        isAlive={isAlive}
        promoted={promoted}
        domain={domain}
      />
    ) : undefined,
    actions: toActions(repository!, onAction),
  }
}

const toActions = (repository: Repository, onAction: Dispatch<string>): Array<AppMenuAction> => {
  const rebuildCommand = `plural build --only ${repository.name} && plural deploy --from ${repository.name} --commit "rebuilding ${repository.name}"`
  const deleteCommand = `plural destroy ${repository.name}`

  return [
    { label: 'Rebuild', onSelect: () => onAction(rebuildCommand) },
    { label: 'Delete', onSelect: () => onAction(deleteCommand), destructive: true },
  ]
}

function PrimaryActionButton({ domain, promoted, isAlive }): JSX.Element {
  return (
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
          {...(isAlive && {
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
  )
}

export { toAppProps }
