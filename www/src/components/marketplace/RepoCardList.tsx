import { Flex } from 'honorable'
import { RepositoryCard } from 'pluralsh-design-system'
import { Link } from 'react-router-dom'

import { fillEmptyColumns, flexBasis } from './utils'

export function RepoCardList({
  repositories, repoProps = {}, urlParams = '', maxWidth = '800px', stretchLastRow = false, size = 'small', ...props
}) {
  return (
    <Flex
      mx={-1}
      align="stretch"
      wrap="wrap"
      {...props}
    >
      {
        repositories?.map(repository => (
          <Flex
            key={`${repository.id}flex`}
            px={0.75}
            marginBottom="large"
            width="auto"
            flexBasis={flexBasis}
            flexGrow={1}
            flexShrink={1}
            minWidth="250px"
            maxWidth={maxWidth}
          >
            <RepositoryCard
              key={repository.id}
              as={Link}
              to={`/repository/${repository.id}${urlParams ? `?${urlParams}` : ''}`}
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
          </Flex>
        ))
      }
      {!stretchLastRow && fillEmptyColumns(10)}
    </Flex>
  )
}
