import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { Flex, Span, Switch } from 'honorable'

import { useActive, useNavigation } from '@pluralsh/design-system'

import {
  Datatype,
  Maybe,
  Recipe,
  RecipeConfiguration,
} from '../../../../generated/graphql'

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
  recipe: Recipe,
  context: Record<string, any>
  setContext: Dispatch<SetStateAction<Record<string, any>>>
  oidc?: boolean
  setOIDC: Dispatch<boolean>
}

export function Configuration({
  recipe, context, setContext, oidc, setOIDC,
}: ConfigurationProps): ReactElement {
  const {
    active, completed, setCompleted, setData,
  } = useActive<Record<string, unknown>>()
  const { onNext } = useNavigation()
  const sections = recipe.recipeSections
  const configurations = sections!.filter(section => section!.repository!.name === active.label).map(section => section!.configuration).flat().filter(c => !!c)
  const setValue = useCallback((
    fieldName, value, valid = true, type = Datatype.String
  ) => setContext(context => ({ ...context, ...{ [fieldName]: { value, valid, type } } })), [setContext])
  const hiddenConfigurations = useMemo(() => configurations.filter(conf => !available(conf, context)), [configurations, context])

  useEffect(() => {
    hiddenConfigurations.forEach(conf => {
      setContext(context => ({ ...context, ...{ [conf!.name!]: { value: context[conf!.name!]?.value, valid: true, type: Datatype.String } } }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenConfigurations.length, setContext])

  useEffect(() => {
    if (configurations.length === 0 && !completed && active.data?.id) setCompleted(true)
  }, [configurations.length, completed, active.data?.id, setCompleted])

  useEffect(() => {
    if (configurations.length === 0 && !active.data?.skipped && completed) {
      setData({ ...active.data, ...{ skipped: true } })
      onNext()
    }
  }, [active.data, completed, configurations.length, onNext, setData])

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
        >Nothing needs doing here! You can continue.
        </Span>
      )}
      {recipe.oidcEnabled && (
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
