import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-apollo'
import { Box, Text, Stack, Select } from 'grommet'
import Scroller from './utils/Scroller'
import { RepositoryChoice } from './Configuration'
import { BreadcrumbsContext } from './Breadcrumbs'
import { apiHost, secure } from '../helpers/hostname'
import { BUILD_PADDING } from './Builds'
import { CONFIGURATIONS_Q } from './graphql/chartmart'
import Loading from './utils/Loading'

function grafanaHost() {
  const [_head, ...rest] = apiHost().split(".")
  return `watchman-grafana.${rest.join('.')}`
}

const GRAFANA_URL = `${secure() ? 'https' : 'http'}://${grafanaHost()}`

function ViewDashboards({repository: {icon, name, dashboards}}) {
  const [current, setCurrent] = useState(dashboards.length > 0?  dashboards[0].name : null)
  const currentDash = dashboards.find(({name}) => name === current)
  return (
    <Box height='calc(100vh - 45px)'>
      <Box gap='small'>
        <Box
          pad={{vertical: 'small', ...BUILD_PADDING}}
          direction='row'
          align='center'
          border='bottom'
          height='60px'>
          <Box direction='row' fill='horizontal' gap='small' align='center'>
            {icon && <img alt='' src={icon} height='40px' width='40px' />}
            <Text weight='bold' size='small'>{name} dashboards</Text>
          </Box>
          <Select
            options={dashboards.map(({name}) => name)}
            value={current}
            onChange={({option}) => setCurrent(option)} />
        </Box>
      </Box>
      <Box height='calc(100vh - 105px)'>
        {dashboards.length <= 0 ? (
          <Box pad='medium'>
            <Text>No dashboards for this repository, contact the publisher to fix this</Text>
          </Box>) : (
          <iframe
            style={{display: 'block', height: 'calc(100vh - 105px', width: '100%'}}
            frameBorder='0'
            src={`${GRAFANA_URL}/d/${currentDash.uid}?orgId=1&refresh=5s&kiosk`} />
        )}
      </Box>
    </Box>
  )
}

export default function Dashboards() {
  const {repo} = useParams()
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {
    const additional = repo ? [{text: repo, url: `/dashboards/${repo}`}] : []
    setBreadcrumbs([{text: 'dashboards', url: '/dashboards'}, ...additional])
  }, [repo])
  const {data} = useQuery(CONFIGURATIONS_Q)

  if (!data) return <Loading />
  const {edges} = data.installations
  const selected = edges.find(({node: {repository: {name}}}) => name === repo)
  if (repo && selected) {
    return <ViewDashboards repository={selected.node.repository} />
  }

  return (
    <Box height='calc(100vh - 45px)' pad={{bottom: 'small'}}>
      <Box gap='small'>
        <Box
          pad={{vertical: 'small', ...BUILD_PADDING}}
          direction='row'
          align='center'
          border='bottom'
          height='60px'>
          <Box fill='horizontal' pad={{horizontal: 'small'}}>
            <Text weight='bold' size='small'>Dashboards</Text>
            <Text size='small' color='dark-3'>See runtime data for each of your installations</Text>
          </Box>
        </Box>
      </Box>
      <Box height='calc(100vh - 105px)'>
        <Scroller
          id='configuration'
          style={{height: '100%', overflow: 'auto'}}
          edges={edges}
          mapper={({node: {repository}}) => (
            <RepositoryChoice
              key={repository.id}
              link={`/dashboards/${repository.name}`}
              config={repository} />
          )} />
      </Box>
    </Box>
  )
}