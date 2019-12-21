import React, { useState } from 'react'
import { useQuery } from 'react-apollo'
import { RECIPE_Q } from './queries'
import { Layer, Box, Text } from 'grommet'
import { ModalHeader } from '../utils/Modal'
import Button, { SecondaryButton } from '../utils/Button'
import { RepositoryIcon } from './Repository'
import { DEFAULT_CHART_ICON, DEFAULT_TF_ICON } from './constants'
import RadioButton from '../utils/RadioButton'
import InputField from '../utils/InputField'

function SubHeading({size, icon, name, description}) {
  return (
    <Box direction='row' gap='small' align='center'>
      <Box width={size}>
        <img  width={size} height={size} src={icon} />
      </Box>
      <Box fill='horizontal'>
        <Text size='small' style={{fontWeight: 500}}>{name}</Text>
        <Text size='small' color='dark-3'>{description}</Text>
      </Box>
    </Box>
  )
}

function RecipeItemHeading({terraform, chart}) {
  if (terraform) {
    return <SubHeading size='30px' icon={DEFAULT_TF_ICON} name={terraform.name} description={terraform.description} />
  }
  return <SubHeading size='30px' icon={chart.icon || DEFAULT_CHART_ICON} name={chart.name} description={chart.description} />
}

function Configure({conf: {name, placeholder, documentation, type}, repo, ctx, setCtx, labelWidth}) {
  const updateCtx = (val) => {
    ctx[repo.id][name] = val
    setCtx({...ctx})
  }
  const current = ctx[repo.id][name]
  switch (type) {
    case "BOOL":
      return <RadioButton label={name} enabled={!!current} onClick={(en) => updateCtx(en)} />
    case "STRING":
      return (
        <InputField
          label={name}
          placeholder={placeholder}
          labelWidth={labelWidth}
          value={current}
          onChange={({target: {value}}) => updateCtx(value)} />
      )
    case "INT":
      return (
        <InputField
          label={name}
          placeholder={placeholder}
          value={current}
          labelWidth={labelWidth}
          onChange={({target: {value}}) => updateCtx(parseInt(value))} />
      )
    default:
      return null
  }
}

function EditSection({recipeSection, item, ctx, setCtx}) {
  const repo = recipeSection.repository
  const recipeItem = recipeSection.recipeItems[item]
  const labelWidth = `${Math.max(...recipeItem.configuration.map(({name}) => name.length * 9))}px`
  return (
    <Box gap='small'>
      <Box direction='row' align='center'>
        <RepositoryIcon repository={repo} size='50px' headingSize='small' />
      </Box>
      <Box fill='horizontal' pad='small' border='top'>
        <RecipeItemHeading {...recipeItem} />
      </Box>
      {recipeItem.configuration && (
        <Box pad='small' gap='xsmall'>
          {recipeItem.configuration.map((conf) => (
            <Configure
              key={conf.name}
              conf={conf}
              ctx={ctx}
              setCtx={setCtx}
              repo={repo}
              labelWidth={labelWidth} />
          ))}
        </Box>
      )}
    </Box>
  )
}

function buildCtx(recipeSections) {
  return recipeSections.reduce((ctx, {repository}) => {
    if (repository.installation) {
      ctx[repository.id] = repository.installation.context
      return ctx
    }
    return ctx[repository.id] = {}
  }, {})
}

function RecipeSectionEditor({recipeSections, section, item, setState}) {
  const [ctx, setCtx] = useState(buildCtx(recipeSections))
  const recipeSection = recipeSections[section]
  const lastSection = recipeSections.length === section + 1
  const lastItem = recipeSection.recipeItems.length === item + 1
  const next = () => {
    if (lastItem) {
      setState({item: 0, section: section + 1})
      return
    }
    setState({item: item + 1, section})
  }

  const prev = () => {
    if (item === 0) {
      const prevSection = section - 1
      setState({item: recipeSections[prevSection].recipeItems.length - 1, section: prevSection})
      return
    }
    setState({item: item - 1, section})
  }

  const hasNext = !lastSection || !lastItem
  const hasPrev = item !== 0 || section !== 0

  return (
    <Box gap='small'>
      <EditSection recipeSection={recipeSections[section]} item={item} ctx={ctx} setCtx={setCtx} />
      <Box direction='row' align='center' justify='end' gap='small'>
        {hasPrev && <SecondaryButton round='xsmall' pad='small' onClick={prev} label='Go back' />}
        {hasNext ? <Button round='xsmall' pad='small' label='Next' onClick={next} /> :
                   <Button round='xsmall' pad='small' label='Finalize' />}
      </Box>
    </Box>
  )
}

export default function Recipe({id, name, setOpen}) {
  const [{section, item}, setState] = useState({section: 0, item: 0})
  const {data, loading} = useQuery(RECIPE_Q, {variables: {id}})
  if (!data || loading) return null
  const {recipeSections} = data.recipe

  return (
    <Layer
      modal
      position='center'
      onEsc={() => setOpen(false)} >
      <Box width='80vw'>
        <ModalHeader text={name} setOpen={setOpen} />
        <Box pad='small'>
          <RecipeSectionEditor
            recipeSections={recipeSections}
            section={section}
            item={item}
            setState={setState} />
        </Box>
      </Box>
    </Layer>
  )
}