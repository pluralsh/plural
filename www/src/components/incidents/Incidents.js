import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Box, Drop, Text, TextInput, ThemeContext } from 'grommet'
import { Scroller, Button } from 'forge-core'
import { useQuery } from 'react-apollo'
import { INCIDENTS_Q } from './queries'
import { extendConnection } from '../../utils/graphql'
import { RepoIcon } from '../repos/Repositories'
import moment from 'moment'
import { Severity } from './Severity'
import { useHistory, useParams } from 'react-router'
import { Checkmark, Close, Notification, Search, User, Tag as TagIcon, Descend, Ascend, Next, BladesVertical } from 'grommet-icons'
import { Status } from './IncidentStatus'
import { BreadcrumbsContext } from '../Breadcrumbs'
import { CreateIncident } from './CreateIncident'
import styled, { keyframes } from 'styled-components';
import { pulse } from 'react-animations';
import { normalizeColor } from 'grommet/utils'
import { IncidentFilter, IncidentSort, IncidentSortNames, Order } from './types'
import { AlternatingBox } from '../utils/AlternatingBox'
import { SlaTimer } from './SlaTimer'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { FixedScroller } from '../utils/SmoothScroller'

export const IncidentViewContext = React.createContext({})

const pulseAnimation = keyframes`${pulse}`;

const BouncyDiv = styled.div`
  animation: 1s ${pulseAnimation} infinite;
`;

function Tags({tags}) {
  return (
    <Box direction='row' gap='xsmall' align='center'>
      {tags.map(({tag}) => (
        <Box key={tag} round='xsmall' pad={{horizontal: 'xsmall', vertical: '2px'}} background='light-2'>
          <Text size='xsmall'>{tag}</Text>
        </Box>
      ))}
    </Box>
  )
}

export function NotificationBadge({size, color, count}) {
  const theme = useContext(ThemeContext)
  const background = color || 'error'

  return (
    <Box as={BouncyDiv} 
         style={{boxShadow: `0 0 3px ${normalizeColor(background, theme)}`}} 
         width={size} height={size} 
         align='center' justify='center'
         round='full' background={background}>
      {count && <Text size='10px'>{count > 10 ? '!!' : count}</Text>}
    </Box>
  )
}

function SubscriptionBadge({incident: {subscription}}) {
  if (!subscription) return null

  return (
    <Box pad={{horizontal: 'small', vertical: 'xsmall'}} round='xsmall' border={{color: 'light-5'}} 
         align='center' justify='center'>
      <Text size='small'>{subscription.plan.name}</Text>
    </Box>
  )
}

export function IncidentRow({incident: {id, repository, title, insertedAt, owner, ...incident}, selected}) {
  let history = useHistory()

  return (
    <Box flex={false} fill='horizontal' pad='small' border={{side: 'bottom', color: 'light-3'}} direction='row' 
        align='center' gap='small' hoverIndicator='light-2' onClick={() => history.push(`/incident/${id}`)}
        height='75px'>
      <RepoIcon repo={repository} />
      <Box fill='horizontal' direction='row' gap='xsmall' align='center'>
        <Box flex={false}>
          <Box direction='row' align='center' gap='small'>
            <Text size='small' weight={500}>{title}</Text>
            <Status incident={incident} />
            <Tags tags={incident.tags} />
            {incident.notificationCount > 0 && <NotificationBadge count={incident.notificationCount} size='15px' />}
          </Box>
          <Text size='small' color='light-5'>created: {moment(insertedAt).fromNow()}, {owner ? `responder: ${owner.email}` : 'unassigned'}</Text>
        </Box>
      </Box>
      <SlaTimer incident={incident} />
      <SubscriptionBadge incident={incident} />
      <Severity incident={incident} />
      {id === selected && <Checkmark color='brand' size='15px' />}
    </Box>
  )
}

function FilterOption({icon, filter, onClick, next}) {
  return (
    <Box direction='row' align='center' fill='horizontal' onClick={onClick} hoverIndicator='light-2' 
         pad={{horizontal: 'small', vertical: 'xsmall'}}>
      <Box direction='row' fill='horizontal' gap='small' align='center'>
        {icon}
        <Text size='small'>{filter.toLowerCase()}</Text>
      </Box>
      {next && <Next size='small' />}
    </Box>
  )
}

const FILTER_DROP_WIDTH = '200px'

function TagInput({setAlternate}) {
  const {setFilters, filters} = useContext(IncidentViewContext)
  const [tag, setTag] = useState('')
  const accept = useCallback(() => {
    setFilters([{type: IncidentFilter.TAG, value: tag}, ...filters])
    setAlternate(null)
  }, [tag, setFilters, setAlternate])
  return (
    <Box direction='row' align='center' gap='xsmall' pad='small' width={FILTER_DROP_WIDTH}>
      <Text size='samll' weight={500}>tag</Text>
      <Box fill='horizontal' border={{side: 'bottom', color: 'light-5'}}>
        <TextInput plain value={tag} onChange={({target: {value}}) => setTag(value)} />
      </Box>
      <Box flex={false} pad='xsmall' round='xsmall' onClick={accept} hoverIndicator='light-3'>
        <Checkmark size='small' />
      </Box>
      <Box flex={false} pad='xsmall' round='xsmall' onClick={() => setAlternate(null)} hoverIndicator='light-3'>
        <Close size='small' />
      </Box>
    </Box>
  )
}

export function FilterSelect() {
  const {filters, setFilters} = useContext(IncidentViewContext)
  const ref = useRef()
  const [open, setOpen] = useState(false)

  return (
    <>
    <Box flex={false} ref={ref} direction='row' gap='xsmall' align='center' background='light-3'  
         hoverIndicator='light-5' round='xsmall' onClick={() => setOpen(true)} focusIndicator={false} 
         pad={{horizontal: 'small', vertical: 'xsmall'}}>
      <BladesVertical size='small' />
      <Text size='small'>Filters</Text>
    </Box>
    {open && (
      <Drop target={ref.current} onClickOutside={() => setOpen(false)} align={{top: 'bottom'}}> 
        <Box flex={false} width={FILTER_DROP_WIDTH}>
          <AlternatingBox>
          {setAlternate => (
            <Box pad={{vertical: 'xsmall'}}>
              <FilterOption 
                icon={<Notification size='small' />}
                filter={IncidentFilter.NOTIFICATIONS} 
                onClick={() => setFilters([...filters, {type: IncidentFilter.NOTIFICATIONS}])} />
              <FilterOption 
                icon={<User size='small' />}
                filter={IncidentFilter.FOLLOWING} 
                onClick={() => setFilters([...filters, {type: IncidentFilter.FOLLOWING}])} />
              <FilterOption
                next
                icon={<TagIcon size='small' />}
                filter={IncidentFilter.TAG} 
                onClick={() => setAlternate(
                  <TagInput setFilters={setFilters} filters={filters} setAlternate={setAlternate} />
                )} />
            </Box>
          )}
          </AlternatingBox>
        </Box>
      </Drop>
    )}
    </>
  )
}

function Filters() {
  const {filters, setFilters} = useContext(IncidentViewContext)
  const removeFilter = useCallback(({type, value}) => {
    setFilters(filters.filter(f => f.type !== type || f.value !== value))
  }, [filters, setFilters])

  return (
    <Box direction='row' gap='xsmall' align='center' fill='horizontal'>
      {filters.map((filter) => (
        <Box key={`${filter.type}:${filter.value}`} direction='row' round='xsmall' pad={{vertical: '2px', horizontal: 'xsmall'}} background='light-2' 
             align='center' onClick={() => removeFilter(filter)} hoverIndicator='light-3' gap='xsmall'>
          <Text size='xsmall' weight={500}>{filter.type.toLowerCase()}</Text>
          {filter.value && <Text size='xsmall'>{filter.value}</Text>}
        </Box>
      ))}
    </Box>
  )
}

const Checked = () => <Checkmark size='small' color='brand' />

function DropdownItem({icon, text, onClick}) {
  return (
    <Box direction='row' align='center' round='xsmall' pad={{horizontal: 'small', vertical: 'xsmall'}}
         onClick={onClick} hoverIndicator='light-3'>
      <Box fill='horizontal'>
        <Text size='small'>{text}</Text>
      </Box>
      {icon}
    </Box>
  )
}

function SortOptions() {
  const ref = useRef()
  const [open, setOpen] = useState(false)
  const {sort, order, setSort, setOrder} = useContext(IncidentViewContext)
  const selectedSort = sort || IncidentSort.INSERTED_AT
  const selectedOrder = order || Order.DESC

  return (
    <>
    <Box ref={ref} flex={false} direction='row' align='center' gap='xsmall' onClick={() => setOpen(true)}>
      {selectedOrder === Order.DESC ? <Descend size='15px' /> : <Ascend size='15px' />}
      <Text size='small'>{IncidentSortNames[selectedSort]}</Text>
    </Box>
    {open && (
      <Drop target={ref.current} onClickOutside={() => setOpen(false)} align={{top: 'bottom'}}>
        <Box flex={false} width='150px'>
          <Box flex={false} pad={{horizontal: 'xsmall', vertical: 'small'}} border='bottom'>
            {Object.values(Order).map((order) => (
              <DropdownItem
                key={order}
                icon={order === selectedOrder ? <Checked /> : null}
                text={order === Order.DESC ? 'Descending' : 'Ascending'}
                onClick={() => setOrder(order)} />
            ))}
          </Box>
          <Box flex={false} pad={{horizontal: 'xsmall', vertical: 'small'}}>
            {Object.keys(IncidentSort).map((sort) => (
              <DropdownItem
                key={sort}
                icon={sort === selectedSort ? <Checked /> : null}
                text={IncidentSortNames[sort]}
                onClick={() => setSort(sort)} />
            ))}
          </Box>
        </Box>
      </Drop>
    )}
    </>
  )
}

export function IncidentToolbar() {
  return (
    <Box flex={false} border={{side: 'bottom', color: 'light-5'}} align='center' direction='row' 
         pad={{vertical: 'xsmall', horizontal: 'small'}}>
      <Filters />
      <SortOptions />
    </Box>
  )
}

function Placeholder() {
  return (
    <Box height='75px' direction='row' pad='small'>
      <Box height='50px' width='50px' background='tone-light' />
      <Box fill='horizontal' gap='xsmall'>
        <Box width='200px' height='13px' background='tone-light' />
        <Box width='400px' height='13px' background='tone-light' />
      </Box>
    </Box>
  )
}

export function Incidents() {
  const [open, setOpen] = useState(false)
  const {incidentId} = useParams()
  const [q, setQ] = useState(null)
  const [filters, setFilters] = useState([])
  const [sort, setSort] = useState(IncidentSort.INSERTED_AT)
  const [order, setOrder] = useState(Order.DESC)
  const {data, loading, fetchMore} = useQuery(INCIDENTS_Q, {
    variables: {q, order, sort, filters}, 
    fetchPolicy: 'cache-and-network'
  })

  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {
    setBreadcrumbs([{url: `/incidents`, text: 'incidents'}])
  }, [setBreadcrumbs])

  if (!data) return <LoopingLogo />

  const {incidents: {edges, pageInfo}} = data

  return (
    <IncidentViewContext.Provider value={{filters, setFilters, order, setOrder, sort, setSort}}>
    <Box fill>
      {!open && (
        <Box fill='horizontal' pad='small' align='center' direction='row' gap='xsmall' justify='end'>
          <FilterSelect />
          <Box fill='horizontal'>
            <TextInput 
              plain
              icon={<Search size='15px' />}
              value={q || ''}
              placeholder='search for an incident'
              onChange={({target: {value}}) => setQ(value)} />
          </Box>
          <Button label='Create' onClick={() => setOpen(true)} />
        </Box>
      )}
      {open && <CreateIncident onCompleted={() => setOpen(false)} />}
      <IncidentToolbar />
      <Box fill>
        <FixedScroller
          loading={loading}
          hasNextPage={pageInfo.hasNextPage}
          itemSize={75}
          items={edges}
          placeholder={Placeholder}
          mapper={({node}) => <IncidentRow key={node.id} incident={node} selected={incidentId} />}
          loadNextPage={() => pageInfo.hasNextPage && fetchMore({
            variables: {cursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult: {incidents}}) => extendConnection(prev, incidents, 'incidents')
          })}
        />
      </Box>
    </Box>
    </IncidentViewContext.Provider>
  )
}