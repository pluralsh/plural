import { useContext } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  Div, Flex, Img, P, Span,
} from 'honorable'

import moment from 'moment'

import Fuse from 'fuse.js'

import { Chip } from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { LoopingLogo } from '../utils/AnimatedLogo'
import InfiniteScroller from '../utils/InfiniteScroller'

import { CHARTS_QUERY } from './queries'
import { packageCardStyle } from './RepositoryPackages'

const defaultChartIcon = `${process.env.PUBLIC_URL}/chart.png`

const searchOptions = {
  keys: ['name', 'description', 'latestVersion'],
  threshold: 0.25,
}

function Chart({ chart, first, last }) {
  return (
    <Flex
      as={Link}
      to={`/charts/${chart.id}`}
      {...packageCardStyle(first, last)}
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
            <Chip ml={1}><Span fontWeight="400">APP</Span></Chip>
          )}
        </Flex>
        <P mt={0.5}>
          {chart.latestVersion} {chart.description ? `- ${chart.description}` : null}
        </P>
      </Div>
      <Flex
        flexGrow={1}
        justifyContent="flex-end"
        color="text-xlight"
        caption
      >
        Created {moment(chart.insertedAt).fromNow()}
      </Flex>
    </Flex>
  )
}

function RepositoryPackagesHelm() {
  const { id } = useContext(RepositoryContext)
  const [q] = useOutletContext()
  const [charts, loadingCharts, hasMoreCharts, fetchMoreCharts] = usePaginatedQuery(CHARTS_QUERY,
    {
      variables: {
        repositoryId: id,
      },
    },
    data => data.charts)

  const fuse = new Fuse(charts, searchOptions)
  const filteredCharts = q ? fuse.search(q).map(({ item }) => item) : charts

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
      {filteredCharts.sort((a, b) => a.name.localeCompare(b.name)).map((chart, i) => (
        <Chart
          key={chart.id}
          chart={chart}
          first={i === 0}
          last={i === filteredCharts.length - 1}
        />
      ))}
    </InfiniteScroller>
  )
}

export default RepositoryPackagesHelm
