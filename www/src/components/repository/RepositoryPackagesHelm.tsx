import { Link, useOutletContext } from 'react-router-dom'
import { Flex } from 'honorable'
import moment from 'moment'
import Fuse from 'fuse.js'
import { Chip } from '@pluralsh/design-system'
import styled, { useTheme } from 'styled-components'

import { useRepositoryContext } from '../../contexts/RepositoryContext'
import usePaginatedQuery from '../../hooks/usePaginatedQuery'
import InfiniteScroller from '../utils/InfiniteScroller'
import LoadingIndicator from '../utils/LoadingIndicator'

import { DEFAULT_CHART_ICON } from '../constants'

import { CHARTS_QUERY } from './queries'
import { packageCardStyle } from './RepositoryPackages'

const searchOptions = {
  keys: ['name', 'description', 'latestVersion'],
  threshold: 0.25,
}

const ChartNameSC = styled.p(({ theme }) => ({
  margin: 0,
  ...theme.partials.text.body1Bold,
}))
const ChartNameDepsSC = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.medium,
}))
const CreatedSC = styled.div(({ theme }) => ({
  ...theme.partials.text.caption,
  textAlign: 'end',
  flexGrow: 1,
  justifyContent: 'flex-end',
  color: theme.colors['text-xlight'],
}))
const VersionDescSC = styled.p(({ theme }) => ({
  margin: 0,
  marginTop: theme.spacing.xxsmall,
}))
const IconSC = styled.img((_) => ({
  width: 64,
}))

function Chart({ chart, first, last }: any) {
  const theme = useTheme()

  return (
    <Flex
      as={Link}
      to={`/charts/${chart.id}`}
      {...packageCardStyle(first, last)}
      gap={theme.spacing.medium}
    >
      <IconSC
        alt={chart.name}
        src={chart.icon || DEFAULT_CHART_ICON}
      />
      <div>
        <ChartNameDepsSC>
          <ChartNameSC>{chart.name}</ChartNameSC>
          {chart.dependencies && chart.dependencies.application && (
            <Chip size="small">APP</Chip>
          )}
        </ChartNameDepsSC>
        <VersionDescSC>
          {chart.latestVersion}{' '}
          {chart.description ? `- ${chart.description}` : null}
        </VersionDescSC>
      </div>
      <CreatedSC>Created {moment(chart.insertedAt).fromNow()}</CreatedSC>
    </Flex>
  )
}

function RepositoryPackagesHelm() {
  const { id } = useRepositoryContext()
  const [q] = useOutletContext() as any
  const [charts, loadingCharts, hasMoreCharts, fetchMoreCharts] =
    usePaginatedQuery(
      CHARTS_QUERY,
      {
        variables: {
          repositoryId: id,
        },
      },
      (data) => data.charts
    )

  const fuse = new Fuse(charts, searchOptions)
  const filteredCharts = q ? fuse.search(q).map(({ item }) => item) : charts

  if (charts.length === 0 && loadingCharts) {
    return <LoadingIndicator />
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
      {filteredCharts
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((chart, i) => (
          <Chart
            key={chart.id}
            chart={chart}
            first={i === 0}
            last={i === filteredCharts.length - 1}
          />
        ))}
      {!filteredCharts?.length && (
        <Flex
          width="100%"
          padding="medium"
          backgroundColor="fill-one"
          border="1px solid border-fill-two"
          borderTop="none"
          borderBottomLeftRadius="4px"
          borderBottomRightRadius="4px"
        >
          No charts found.
        </Flex>
      )}
    </InfiniteScroller>
  )
}

export default RepositoryPackagesHelm
