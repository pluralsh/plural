import React, { useState, useCallback } from 'react'
import { LabeledInput } from '../repos/CreateRepository'
import { TextInput, Box, Select, Layer, Text, Anchor, Stack, RangeSelector } from 'grommet'
import { FaDollarSign } from 'react-icons/fa'
import { Button, SecondaryButton, ModalHeader, HoveredBackground } from 'forge-core'
import { FormPrevious, Cube, FormNext, Trash, Add } from 'grommet-icons'
import { useMutation } from 'react-apollo'
import { CREATE_PLAN } from './queries'
import { REPO_Q } from '../repos/queries'
import { hover } from './Plan'
import { deepUpdate, updateCache } from '../../utils/graphql'
import { SeverityNub } from '../incidents/Severity'

const FEATURES = 'features'
const LINE_ITEMS = 'items'
const PLAN = 'plan'
const SLAS = 'slas'

function LineItem({item: {cost, name, dimension}, included, state, setState}) {
  const {quantity} = included.find((inc) => inc.dimension === dimension)
  function removeItem() {
    return {...state, lineItems: {
      items: state.lineItems.items.filter((li) => li.dimension !== dimension),
      included: state.lineItems.included.filter((inc) => inc.dimension !== dimension)
    }}
  }

  return (
    <Box direction='row' gap='xsmall' align='center'>
      <Cube size='15px' color='focus' />
      <Text size='small'>
        {name} - ${cost / 100} / {dimension} ({quantity} included)
      </Text>
      <HoveredBackground>
        <Box accentable focusIndicator={false} margin={{left: 'small'}} onClick={() => setState(removeItem())}>
          <Trash size='15px'  />
        </Box>
      </HoveredBackground>
    </Box>
  )
}

function Feature({name, description, removeFeature}) {
  return (
    <Box direction='row' align='center' gap='small'>
      <Box gap='xsmall'>
        <Text size='small' weight={500}>{name}</Text>
        <Text size='small'><i>{description}</i></Text>
      </Box>
      <HoveredBackground>
        <Box accentable focusIndicator={false} onClick={() => removeFeature(name)}>
          <Trash size='15px' />
        </Box>
      </HoveredBackground>
    </Box>
  )
}

function NumericInput({value, onChange, placeholder, ...props}) {
  return (
    <TextInput
      {...props}
      placeholder={placeholder}
      value={value ? value + '' : ''}
      onChange={({target: {value}}) => {
        const parsed = parseInt(value)
        if (!isNaN(parsed)) {
          onChange(parsed)
        } else {
          onChange(null)
        }
      }} />
  )
}

function DollarInput({value, onChange, ...props}) {
  return (
    <NumericInput 
      {...props}
      icon={<FaDollarSign size='12px' />}
      value={value && (value / 100)} 
      onChange={(v) => onChange(v * 100)} />
  )
}

function FeatureCreator({state, setState, setDisplay, mutation, loading}) {
  const [feature, setFeature] = useState({name: '', description: ''})
  const {metadata: {features}} = state
  function addFeature() {
    return {...state, metadata: {...state.metadata, features: [...features, feature]}}
  }

  function removeFeature(name) {
    return {...state, metadata: {...state.metadata, features: features.filter((f) => f.name !== name)}}
  }

  return (
    <Box gap='small' pad='small'>
      <Box direction='row' align='center' gap='small'>
        <FormPrevious size='20px' />
        <Anchor size='small' onClick={() => setDisplay(PLAN)}>
          Go back to plan form
        </Anchor>
      </Box>
      <Box direction='row' fill='horizontal'>
        <Box gap='xsmall' width='40%' fill='vertical' pad='medium'>
          {features.length > 0 ?
            features.map((feature) => (
              <Feature
                key={feature.name}
                {...feature}
                removeFeature={removeFeature} />)) :
            <Box><Text size='small' weight={500}>No features created yet</Text></Box>
          }
        </Box>
        <Box gap='small' width='60%'>
          <LabeledInput label='1. Name of the feature'>
            <TextInput
              placeholder='a name'
              value={feature.name}
              onChange={({target: {value}}) => setFeature({...feature, name: value})} />
          </LabeledInput>
          <LabeledInput label='2. Add a small description of its purpose'>
            <TextInput
              placeholder='description'
              value={feature.description}
              onChange={({target: {value}}) => setFeature({...feature, description: value})} />
          </LabeledInput>
        </Box>
      </Box>
      <Box direction='row' justify='end' gap='xsmall' align='center'>
        <Anchor onClick={() => setDisplay(SLAS)} size='small'>
          Add service levels
        </Anchor>
        <FormNext size='20px' />
      </Box>
      <Box direction='row' justify='end' gap='small' margin={{top: 'small'}}>
        <SecondaryButton
          label='Add feature'
          round='xsmall'
          onClick={() => setState(addFeature())} />
        <Button
          loading={loading}
          label='Create'
          round='xsmall'
          onClick={mutation} />
      </Box>
    </Box>
  )
}

function ItemCreator({state, setState, setDisplay, mutation, loading}) {
  const [lineItem, setLineItem] = useState({
    name: '',
    dimension: '',
    included: 1,
    cost: 500
  })
  const {period, lineItems: {items, included}} = state

  function addLineItem() {
    const {name, dimension, cost} = lineItem
    return {
      ...state,
      lineItems: {
        items: [...items, {name, dimension, period, cost}],
        included: [...included, {dimension, quantity: lineItem.included}]
      }
    }
  }

  return (
    <Box gap='small' pad='small'>
      <Box direction='row' align='center' gap='small'>
        <FormPrevious size='20px' />
        <Anchor size='small' onClick={() => setDisplay(PLAN)}>
          Go back to plan form
        </Anchor>
      </Box>
      <Box direction='row' fill='horizontal'>
        <Box gap='xsmall' width='40%' fill='vertical' pad='medium'>
          {items.length > 0 ?
            items.map((item) => (
              <LineItem
                key={item.dimension}
                item={item}
                included={included}
                state={state}
                setState={setState} />)) :
            <Box><Text size='small' weight={500}>No line items created yet</Text></Box>
          }
        </Box>
        <Box gap='small' width='60%'>
          <LabeledInput label='1. Display name for the line item'>
            <TextInput
              placeholder='a good name'
              value={lineItem.name}
              onChange={({target: {value}}) => setLineItem({...lineItem, name: value})} />
          </LabeledInput>
          <LabeledInput label='2. Name of the type of usage it represents (eg users/storage)'>
            <TextInput
              placeholder='user'
              value={lineItem.dimension}
              onChange={({target: {value}}) => setLineItem({...lineItem, dimension: value})} />
          </LabeledInput>
          <LabeledInput label='3. Amount included in the base plan'>
          <TextInput
              placeholder='user'
              value={lineItem.included + ''}
              onChange={({target: {value}}) => setLineItem({...lineItem, included: parseInt(value)})} />
          </LabeledInput>
          <LabeledInput label='4. Cost per unit'>
            <DollarInput
              value={lineItem.cost}
              onChange={(cost) => setLineItem({...lineItem, cost: cost})} />
          </LabeledInput>
        </Box>
      </Box>
      <Box direction='row' justify='end' gap='xsmall' align='center'>
        <Anchor onClick={() => setDisplay(FEATURES)} size='small'>
          Add features
        </Anchor>
        <FormNext size='20px' />
      </Box>
      <Box direction='row' justify='end' gap='small' margin={{top: 'small'}}>
        <SecondaryButton
          label='Add line item'
          round='xsmall'
          onClick={() => setState(addLineItem())} />
        <Button
          loading={loading}
          label='Create'
          round='xsmall'
          onClick={mutation} />
      </Box>
    </Box>
  )
}

function PlanForm({state, setState, setDisplay, mutation, loading}) {
  const updatePeriod = (period) => deepUpdate(
    {...state, period}, 
    'lineItems.items', 
    (items) => items.map((item) => ({...item, period}))
  )

  return (
    <Box gap='small' pad='small'>
      <LabeledInput label='1. Give it a name'>
        <TextInput
          placeholder='a good name'
          value={state.name}
          onChange={({target: {value}}) => setState({...state, name: value})} />
      </LabeledInput>
      <LabeledInput label='2. Give it a base cost'>
        <DollarInput
          placeholder='Cost in dollars'
          value={state.cost}
          onChange={(cost) => setState({...state, cost: cost})} />
      </LabeledInput>
      <LabeledInput label='3. Give it a billing period (monthly/yearly)'>
        <Select
          size='small'
          value={state.period}
          options={['monthly', 'yearly']}
          onChange={({option}) => setState(updatePeriod(option))} />
      </LabeledInput>
      <Box direction='row' justify='end' gap='xsmall' align='center'>
        <Anchor onClick={() => setDisplay(LINE_ITEMS)} size='small'>
          Add line items
        </Anchor>
        <FormNext size='20px' />
      </Box>
      <Box direction='row' justify='end' margin={{top: 'small'}}>
        <Button
          label='Create'
          round='xsmall'
          loading={loading}
          onClick={mutation} />
      </Box>
    </Box>
  )
}

export function ServiceLevel({level: {minSeverity, maxSeverity, responseTime}, deleteLevel}) {
  return (
    <Box direction='row' gap='xsmall'>
      <SeverityNub severity={minSeverity} />
      <Text size='small'>to</Text>
      <SeverityNub severity={maxSeverity} />
      <Text size='small' weight={500}>response time:</Text>
      <Text size='small'>{responseTime}</Text>
      {deleteLevel && (
        <Box flex={false} pad='xsmall' round='xsmall' onClick={() => deleteLevel({minSeverity, maxSeverity})} hoverIndicator={false}>
          <Trash size='small' />
        </Box>
      )}
    </Box>
  )
}

export function SlaForm({attributes, setAttributes, serviceLevel: {minSeverity, maxSeverity, responseTime}, setServiceLevel}) {
  const deleteSla = useCallback(({minSeverity, maxSeverity}) => { 
    const serviceLevels = attributes.serviceLevels.filter((l) => (
      l.minSeverity !== minSeverity || l.maxSeverity !== maxSeverity
    ))

    setAttributes({...attributes, serviceLevels})
  },  [attributes, setAttributes])

  return (
    <Box direction='row' fill pad='small' gap='small'>
      <Box gap='xsmall' width='50%'>
        {attributes.serviceLevels.map(({minSeverity, maxSeverity, responseTime}) => (
          <ServiceLevel 
            key={`${minSeverity}:${maxSeverity}`} 
            level={{minSeverity, maxSeverity, responseTime}} 
            deleteLevel={deleteSla} />
        ))}
      </Box>
      <Box width='50%' gap='xsmall'>
        <LabeledInput label='1. Select a range of incident severities'>
          <Stack>
            <Box direction="row" justify="between">
              {[0, 1, 2, 3, 4, 5].map(value => (
                <Box key={value} pad="small" border={false}>
                  <Text style={{ fontFamily: 'monospace' }}>{value}</Text>
                </Box>
              ))}
            </Box>
            <RangeSelector invert={false} min={0} max={5} size="full" round="small" color='light-5'
              values={[minSeverity, maxSeverity]} 
              onChange={([minSeverity, maxSeverity]) => setServiceLevel({responseTime, minSeverity, maxSeverity})}
            />
          </Stack>
        </LabeledInput>
        <LabeledInput label='2. Specify the number of minutes to first response'>
          <NumericInput placeholder='60' value={responseTime} onChange={(responseTime) => setServiceLevel({
            responseTime, minSeverity, maxSeverity
          })} />
        </LabeledInput>
      </Box>
    </Box>
  )
}

function NavigableSlaForm({state, setState, mutation, loading}) {
  const [serviceLevel, setServiceLevel] = useState({minSeverity: 0, maxSeverity: 3, responseTime: 30})
  
  return (
    <Box fill>
      <SlaForm 
        attributes={state} 
        setAttributes={setState} 
        serviceLevel={serviceLevel} 
        setServiceLevel={setServiceLevel} />
      <Box direction='row' justify='end' gap='small' margin={{top: 'small'}}>
        <SecondaryButton
          label='Add service level'
          round='xsmall'
          onClick={() => setState({...state, serviceLevels: [...state.serviceLevels, serviceLevel]})} />
        <Button
          loading={loading}
          label='Create'
          round='xsmall'
          onClick={mutation} />
      </Box>
    </Box>
  )
}

function FormSwitch({display, ...rest}) {
  switch (display) {
    case "items":
      return <ItemCreator {...rest} />
    case "features":
      return <FeatureCreator {...rest} />
    case 'slas':
      return <NavigableSlaForm {...rest} />
    default:
      return <PlanForm {...rest} />
  }
}

export function CreateAnchor({onClick}) {
  return (
    <Box as={hover} border={{color: 'light-5'}} focusIndicator={false} pad='small'
      direction='row' gap='xsmall' align='center' onClick={onClick}>
      <Add size='small' />
      <Text size='small'>Create plan</Text>
    </Box>
  )
}

export default function CreatePlan({repository, setOpen}) {
  const repositoryId = repository.id
  const [state, setState] = useState({
    name: '', cost: 500, period: 'monthly',
    lineItems: { items: [], included: [] },
    metadata: { features: [] },
    serviceLevels: []
  })
  const [display, setDisplay] = useState(true)
  const [mutation, {loading}] = useMutation(CREATE_PLAN, {
    variables: {repositoryId, attributes: state},
    update: (cache, {data: {createPlan}}) => {
      updateCache(cache, {
        query: REPO_Q,
        variables: {repositoryId},
        update: (prev) => deepUpdate(prev, 'repository.plans', (plans) => [...plans, createPlan])
      })
    },
    onCompleted: () => setOpen(false)
  })

  return (
    <Layer
      modal
      position='center'
      onEsc={() => setOpen(false)}>
      <Box width='80vw'>
        <ModalHeader text='Create Plan' setOpen={setOpen} />
        <Box gap='medium' pad='small'>
          <FormSwitch
            display={display}
            setDisplay={setDisplay}
            state={state}
            setState={setState}
            mutation={mutation}
            loading={loading} />
        </Box>
      </Box>
    </Layer>
  )
}