import React, { useEffect, useState } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import { ModalHeader, Button, SecondaryButton, InputCollection, ResponsiveInput, ResponsiveInputContainer } from 'forge-core'
import { RECIPE_Q, INSTALL_RECIPE, REPO_Q, INSTALL_REPO } from './queries'
import { Layer, Box, Text, CheckBox } from 'grommet'
import { RepositoryIcon } from './Repository'
import { DEFAULT_CHART_ICON, DEFAULT_TF_ICON } from './constants'
import Plan from '../payments/Plan'
import { AlternatingBox } from '../utils/AlternatingBox'
import { Subscriber } from '../payments/CreateSubscription'

function SubHeading({size, icon, name, description}) {
  return (
    <Box direction='row' gap='small' align='center'>
      <Box width={size}>
        <img alt='' width={size} height={size} src={icon} />
      </Box>
      <Box fill='horizontal'>
        <Text size='small' weight={500}>{name}</Text>
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

function Configure({conf: {name, placeholder, type}, repo, ctx, setCtx}) {
  const updateCtx = (val) => {
    ctx[repo.id][name] = val
    setCtx({...ctx})
  }
  const current = ctx[repo.id][name]
  switch (type) {
    case "BOOL":
      return (
        <ResponsiveInputContainer
          label={name}
          content={
            <CheckBox checked={!!current} onChange={({target: {checked}}) => updateCtx(!!checked)} />
          } />
      )
    case "STRING":
      return (
        <ResponsiveInput
          label={name}
          placeholder={placeholder}
          value={current || ""}
          onChange={({target: {value}}) => updateCtx(value)} />
      )
    case "INT":
      return (
        <ResponsiveInput
          label={name}
          placeholder={placeholder}
          value={current || ""}
          onChange={({target: {value}}) => updateCtx(parseInt(value))} />
      )
    default:
      return null
  }
}

function Documentation({name, documentation}) {
  return (
    <Box direction='row' gap='xsmall'>
      <Text weight='bold' size='small'>{name}</Text>
      <Text size='small'><i>{documentation}</i></Text>
    </Box>
  )
}

const DOC_WIDTH = 40

function EditSection({recipeSection, item, ctx, setCtx}) {
  const repo = recipeSection.repository
  const recipeItem = recipeSection.recipeItems[item]
  return (
    <Box gap='small'>
      <Box direction='row' align='center'>
        <RepositoryIcon repository={repo} size='50px' headingSize='small' />
      </Box>
      <Box fill='horizontal' pad='small' border='top'>
        <RecipeItemHeading {...recipeItem} />
      </Box>
      <Box direction='row' fill='horizontal'>
        {recipeItem.configuration.length > 0 ? (
          <><Box width={`${100 - DOC_WIDTH}%`}>
            {recipeItem.configuration && (
              <Box pad='small' gap='xsmall'>
                <InputCollection>
                {recipeItem.configuration.map((conf) => (
                  <Configure
                    key={conf.name}
                    conf={conf}
                    ctx={ctx}
                    setCtx={setCtx}
                    repo={repo} />
                ))}
                </InputCollection>
              </Box>
            )}
            </Box>
            <Box width={`${DOC_WIDTH}%`} pad='small' gap='xxsmall' border='left'>
              <Text weight='bold' size='small' margin={{bottom: 'xsmall'}}>Documentation</Text>
              {recipeItem.configuration.map(({name, documentation}) => (
                documentation ? <Documentation name={name} documentation={documentation} /> : null
              ))}
            </Box></>) :
        (<Box fill='horizontal' align='center' justify='center'>
            <Text weight='bold' size='small'>Nothing to configure</Text>
         </Box>)
      }
      </Box>
    </Box>
  )
}

function buildCtx(recipeSections) {
  return recipeSections.reduce((ctx, {repository}) => {
    ctx[repository.id] = {}
    if (repository.installation && repository.installation.context) {
      ctx[repository.id] = repository.installation.context
    }
    
    return ctx
  }, {})
}

function InstallRecipe({id, ctx, repository, setOpen}) {
  const [mutation, {loading, error}] = useMutation(INSTALL_RECIPE, {
    variables: {id, ctx: JSON.stringify(ctx)},
    onCompleted: () => setOpen(false),
    refetchQueries: [{query: REPO_Q, variables: {repositoryId: repository.id}}]
  })
  return (
    <Button
      loading={loading}
      error={error}
      onClick={mutation}
      round='xsmall'
      pad='small'
      label='Install' />
  )
}

function RecipeSectionEditor({id, recipeSections, section, item, setState, repository, setOpen}) {
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
                   <InstallRecipe id={id} ctx={ctx} repository={repository} setOpen={setOpen} />}
      </Box>
    </Box>
  )
}

function Install({repository, setOpen}) {
  const [mutation] = useMutation(INSTALL_REPO, {
    variables: {repositoryId: repository.id},
    refetchQueries: [{query: REPO_Q, variables: {repositoryId: repository.id}}]
  })
  useEffect(() => { !repository.installation && mutation() }, [repository])

  if (!repository.installation) return null
  
  return (
    <Layer modal>
      <Box width='50vw'>
        <ModalHeader text='Subscribe to a plan' setOpen={setOpen} />
        <AlternatingBox>
        {setAlternate => (
          <Box pad='small' gap='small'>
            {repository.plans.map((plan) => (
              <Plan key={plan.id}  
                    subscription={repository.installation.subscription} 
                    approvePlan={(plan) => setAlternate(
                      <Subscriber 
                        plan={plan} 
                        installationId={repository.installation.id}
                        repositoryId={repository.id}
                        setOpen={() => setAlternate(null)} />
                    )} 
                    repository={repository}
                    plan={plan} />
            ))}
          </Box>
        )}
        </AlternatingBox>
      </Box>
    </Layer>
    
  )
}

function needsInstall({installation, plans}) {
  if (!installation) return true
  if (plans && plans.length > 0 && !installation.subscription) return true

  return false
}

function RecipeInner({recipe: {id, name}, setOpen}) {
  const [{section, item}, setState] = useState({section: 0, item: 0})
  const {data, loading} = useQuery(RECIPE_Q, {variables: {id}})
  if (!data || loading) return null
  
  const {recipeSections, repository} = data.recipe

  return (
    <Layer  modal position='center' onEsc={() => setOpen(false)} >
      <Box width='80vw'>
        <ModalHeader text={name} setOpen={setOpen} />
        <Box pad='small'>
          <RecipeSectionEditor
            id={id}
            recipeSections={recipeSections}
            repository={repository}
            section={section}
            item={item}
            setState={setState}
            setOpen={setOpen} />
        </Box>
      </Box>
    </Layer>
  )
}

export default function Recipe({recipe, setOpen, repository}) {
  const needs = needsInstall(repository)
  if (needs) return <Install repository={repository} />

  return <RecipeInner recipe={recipe} setOpen={setOpen} />
}