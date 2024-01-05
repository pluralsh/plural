import { RepositoryCard } from '@pluralsh/design-system'
import { Link } from 'react-router-dom'
import { useTheme } from 'styled-components'

import { CardGrid } from '../utils/layout/CardGrid'
import { getRepoIcon } from '../repository/misc'

export function RepoCardList({
  repositories,
  repoProps = {},
  urlParams = '',
  size = 'small',
  ...props
}: any) {
  const theme = useTheme()

  return (
    <CardGrid {...props}>
      {repositories?.map((repository) => (
        <RepositoryCard
          key={repository.id}
          as={Link}
          to={`/repository/${repository.name}${
            urlParams ? `?${urlParams}` : ''
          }`}
          color="text"
          textDecoration="none"
          width="100%"
          title={repository.name}
          imageUrl={getRepoIcon(repository, theme.mode)}
          publisher={repository.publisher?.name}
          description={repository.description}
          tags={repository.tags.map(({ tag }) => tag)}
          priv={repository.private}
          installed={!!repository.installation}
          verified={repository.verified}
          trending={repository.trending}
          releaseStatus={repository.releaseStatus}
          size={size}
          {...repoProps}
        />
      ))}
    </CardGrid>
  )
}
