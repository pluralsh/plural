import { Div, Flex } from 'honorable'
import { RepositoryCard } from '@pluralsh/design-system'
import { Link } from 'react-router-dom'

import { fillEmptyColumns, flexBasis } from './utils'
import AppCard, { MarketplaceAppCard } from './AppCard'

export function RepoCardList({
  repositories, repoProps = {}, urlParams = '', maxWidth = '800px', stretchLastRow = false, size = 'small', ...props
}: any) {
  console.log('repoProps', repoProps)

  return (
    <Div
      display="grid"
      gap="medium"
      gridTemplateColumns="repeat(auto-fit, minmax(350px, 1fr))"
      {...props}
    >
      {
        repositories?.map(repository => (
          <MarketplaceAppCard
            key={repository.id}
            as={Link}
            to={`/repository/${repository.name}${urlParams ? `?${urlParams}` : ''}`}
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
        ))
      }
      {!stretchLastRow && fillEmptyColumns(10)}
    </Div>
  )
}
