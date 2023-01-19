import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { Flex, Span, Switch } from 'honorable'

import { useActive } from '@pluralsh/design-system'

import { Maybe, Recipe, RecipeConfiguration } from '../../../../generated/graphql'

import { ConfigurationItem } from './ConfigurationItem'
import { OperationType } from './types'

const available = (config, context) => {
  if (!config.condition) return true

  const { condition } = config

  switch (condition.operation) {
  case OperationType.NOT:
    return !(context[condition.field]?.value)
  case OperationType.PREFIX:
    return context[condition.field]?.value?.startsWith(condition.value) ?? false
  }

  return true
}

interface ConfigurationProps {
  // TODO: Remove object extension once api and graphql files are updated
  recipe: Recipe & {oidcEnabled?: boolean},
  context: Record<string, any>
  setContext: Dispatch<SetStateAction<Record<string, any>>>
  oidc?: boolean
  setOIDC: Dispatch<boolean>
}

export function Configuration({
  recipe, context, setContext, oidc, setOIDC,
}: ConfigurationProps): ReactElement {
  const { active } = useActive<Record<string, unknown>>()
  const sections = recipe.recipeSections
  const configurations = sections!.filter(section => section!.repository!.name === active.label).map(section => section!.configuration).flat().filter(c => !!c)
  const setValue = useCallback((fieldName, value, valid = true) => setContext(context => ({ ...context, ...{ [fieldName]: { value, valid } } })), [setContext])
  const hasOIDC = useMemo(() => !!recipe.oidcSettings, [recipe.oidcSettings])
  const hiddenConfigurations = useMemo(() => configurations.filter(conf => !available(conf, context)), [configurations, context])

  useEffect(() => {
    hiddenConfigurations.forEach(conf => {
      setContext(context => ({ ...context, ...{ [conf!.name!]: { value: context[conf!.name!]?.value, valid: true } } }))
    })
  }, [hiddenConfigurations.length, setContext])

  return (
    <Flex
      gap="large"
      direction="column"
      marginRight="xsmall"
    >
      {configurations.filter(conf => available(conf, context)).map((conf?: Maybe<RecipeConfiguration>) => (
        <ConfigurationItem
          key={`${recipe.name}-${conf!.name}`}
          config={conf}
          ctx={context}
          setValue={setValue}
        />
      ))}
      {configurations?.length === 0 && (
        <Span
          color="text-light"
          body2
        >No configuration available.
        </Span>
      )}
      {hasOIDC && (
        <div>
          <Switch
            checked={oidc}
            onChange={({ target: { checked } }) => setOIDC(checked)}
          >Enable OIDC
          </Switch>
        </div>
      )}
    </Flex>
  )
}
