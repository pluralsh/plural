import { RepositoryCard } from '@pluralsh/design-system'
import { Link } from 'react-router-dom'

import { CardGrid } from '../utils/layout/CardGrid'

export function RepoCardList({
  repositories,
  repoProps = {},
  urlParams = '',
  size = 'small',
  ...props
}: any) {
  return (
    <CardGrid {...props}>
      {repositories?.map(repository => (
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
          imageUrl={repository.darkIcon || repository.icon}
          publisher={repository.publisher?.name}
          description={repository.description}
          tags={repository.tags.map(({ tag }) => tag)}
          priv={repository.private}
          installed={!!repository.installation}
          verified={repository.verified}
          trending={repository.trending}
          size={size}
          {...repoProps}
        />
      ))}
    </CardGrid>
  )
}
