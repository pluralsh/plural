import React, { useState } from 'react'
import { LabeledInput } from '../repos/CreateRepository'
import { TextInput, Box, Select, Layer, Text, Anchor } from 'grommet'
import { FaDollarSign } from 'react-icons/fa'
import Button, { SecondaryButton } from '../utils/Button'
import { ModalHeader } from '../utils/Modal'
import { FormPrevious, Cube, FormNext, Trash } from 'grommet-icons'
import { useMutation } from 'react-apollo'
import { CREATE_PLAN } from './queries'
import { REPO_Q } from '../repos/queries'
import HoveredBackground from '../utils/HoveredBackground'

function LineItem({item: {cost, name, dimension}, included, state, setState}) {
  const {quantity} = included.find((inc) => inc.dimension === dimension)
  function removeItem() {
    return {
      ...state,
      lineItems: {
        items: state.lineItems.items.filter((li) => li.dimension !== dimension),
        included: state.lineItems.included.filter((inc) => inc.dimension !== dimension)
      }
    }
  }

  return (
    <Box direction='row' gap='xsmall' align='center'>
      <Cube size='15px' color='focus' />
      <Text size='small'>
        {name} - ${cost} / {dimension} ({quantity} included)
      </Text>
      <HoveredBackground>
        <Box accentable style={{cursor: 'pointer'}} margin={{left: 'small'}}>
          <Trash size='15px' onClick={() => setState(removeItem())} />
        </Box>
      </HoveredBackground>
    </Box>
  )
}

function DollarInput({value, onChange, placeholder}) {
  return (
    <Box direction='row' border round='xxsmall' pad='xsmall' align='center'>
      <FaDollarSign size='15px' />
      <TextInput
        plain
        placeholder={placeholder}
        value={(value / 100) + ''}
        onChange={({target: {value}}) => onChange(parseInt(value) * 100)} />
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
        <Anchor size='small' onClick={() => setDisplay(true)}>
          Go back to plan form
        </Anchor>
      </Box>
      <Box direction='row' fill='horizontal'>
        <Box gap='xsmall' width='40%' fill='vertical' pad='medium' align='center'>
          {items.length > 0 ?
            items.map((item) => (
              <LineItem
                key={item.dimension}
                item={item}
                included={included}
                state={state}
                setState={setState} />)) :
            <Box><Text size='small' style={{fontWeight: 500}}>No line items created yet</Text></Box>
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
      <Box direction='row' justify='end' gap='small' margin={{top: 'small'}}>
        <SecondaryButton
          label='Add line item'
          pad='small'
          round='xsmall'
          onClick={() => setState(addLineItem())} />
        <Button
          loading={loading}
          pad='small'
          label='Create'
          round='xsmall'
          onClick={mutation} />
      </Box>
    </Box>
  )
}

function PlanForm({state, setState, setDisplay, mutation, loading}) {
  function updatePeriod(period) {
    return {
      ...state,
      period: period,
      lineItems: {
        ...state.lineItems,
        items: state.lineItems.items.map((item) => ({...item, period: period}))
      }
    }
  }

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
        <Anchor onClick={() => setDisplay(false)} size='small'>
          Add line items
        </Anchor>
        <FormNext size='20px' />
      </Box>
      <Box direction='row' justify='end' margin={{top: 'small'}}>
        <Button
          pad='small'
          label='Create'
          round='xsmall'
          loading={loading}
          onClick={mutation} />
      </Box>
    </Box>
  )
}

export default function CreatePlan({repository, setOpen}) {
  const repositoryId = repository.id
  const [state, setState] = useState({
    name: '',
    cost: 500,
    period: 'monthly',
    lineItems: {
      items: [],
      included: []
    }
  })
  const [display, setDisplay] = useState(true)
  const [mutation, {loading}] = useMutation(CREATE_PLAN, {
    variables: {repositoryId, attributes: state},
    update: (cache, {data: {createPlan}}) => {
      const prev = cache.readQuery({query: REPO_Q, variables: {repositoryId}})
      cache.writeQuery({
        query: REPO_Q,
        variables: {repositoryId},
        data: {
          ...prev,
          repository: {
            ...prev.repository,
            plans: [...prev.repository.plans, createPlan]
          }
        }
      })
      setOpen(false)
    }
  })

  return (
    <Layer
      modal
      position='center'
      onEsc={() => setOpen(false)}>
      <Box width='80vw'>
        <ModalHeader text='Create Plan' setOpen={setOpen} />
        <Box gap='medium' pad='small'>
          {display ? <PlanForm
                        state={state}
                        setState={setState}
                        setDisplay={setDisplay}
                        mutation={mutation}
                        loading={loading} /> :
                     <ItemCreator
                        state={state}
                        setState={setState}
                        setDisplay={setDisplay}
                        mutation={mutation}
                        loading={loading} />}
        </Box>
      </Box>
    </Layer>
  )
}