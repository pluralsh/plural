import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Div, Flex, Img, P } from 'honorable'
import { Tag } from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { LoopingLogo } from '../utils/AnimatedLogo'
import InfiniteScroller from '../utils/InfiniteScroller'

import { CHARTS_QUERY } from './queries'

const defaultChartIcon = `${process.env.PUBLIC_URL}/chart.png`

function Chart({ chart }) {
  return (
    <Flex
      px={1}
      py={0.5}
      mb={0.5}
      as={Link}
      to={`/charts/${chart.id}`}
      color="text"
      textDecoration="none"
      align="center"
      hoverIndicator="fill-one"
      borderRadius={4}
    >
      <Img
        alt={chart.name}
        width={64}
        height={64}
        src={chart.icon || defaultChartIcon}
      />
      <Div ml={1}>
        <Flex align="center">
          <P
            body1
            fontWeight={500}
          >
            {chart.name}
          </P>
          {chart.dependencies && chart.dependencies.application && (
            <Tag ml={1}>
              APP
            </Tag>
          )}
        </Flex>
        <P mt={0.5}>
          {chart.latestVersion} {chart.description ? `- ${chart.description}` : null}
        </P>
      </Div>
    </Flex>
  )
}

function RepositoryPackagesHelm() {
  const { id } = useContext(RepositoryContext)
  const [charts, loadingCharts, hasMoreCharts, fetchMoreCharts] = usePaginatedQuery(
    CHARTS_QUERY,
    {
      variables: {
        repositoryId: id,
      },
    },
    data => data.charts
  )

  if (charts.length === 0 && loadingCharts) {
    return (
      <Flex
        pt={2}
        justify="center"
      >
        <LoopingLogo />
      </Flex>
    )
  }

  return (
    <InfiniteScroller
      loading={loadingCharts}
      hasMore={hasMoreCharts}
      loadMore={fetchMoreCharts}
      // Allow for scrolling in a flexbox layout
      flexGrow={1}
      height={0}
    >
      {charts.map(chart => (
        <Chart
          key={chart.id}
          chart={chart}
        />
      ))}
    </InfiniteScroller>
  )
}

export default RepositoryPackagesHelm
