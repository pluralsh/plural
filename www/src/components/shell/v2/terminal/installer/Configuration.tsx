import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useCallback,
} from 'react'
import { Flex, Span } from 'honorable'
import { useActive } from '@pluralsh/design-system'

import { Maybe, Recipe, RecipeConfiguration } from '../../../../../generated/graphql'

import { ConfigurationItem } from './ConfigurationItem'
import { OperationType } from './types'

const available = (config, context) => {
  if (!config.condition) return true

  const { condition } = config

  switch (condition.operation) {
  case OperationType.NOT:
    return !context[condition.field]
  }

  return true
}

interface ConfigurationProps {
  recipe: Recipe,
  context: Record<string, unknown>
  setContext: Dispatch<SetStateAction<Record<string, unknown>>>
  oidc?: boolean
  setOIDC: Dispatch<boolean>
}

export function Configuration({
  recipe, context, oidc, setContext, setOIDC,
}: ConfigurationProps): ReactElement {
  const { active } = useActive<Record<string, unknown>>()
  const sections = recipe.recipeSections
  const configurations = sections!.filter(section => section!.repository!.name === active.label).map(section => section!.configuration).flat().filter(c => !!c)
  const setValue = useCallback((fieldName, value, valid = true) => setContext({ ...context, ...{ [fieldName]: { value, valid } } }), [setContext, context])

  return (
    <Flex
      gap="large"
      direction="column"
      marginRight="xsmall"
    >
      {configurations.filter(conf => available(conf, context)).map((conf?: Maybe<RecipeConfiguration>) => (
        <ConfigurationItem
          key={`${recipe.name}-${conf?.name}`}
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
      {/* {recipe.oidcEnabled && ( */}
      {/*  <div> */}
      {/*    <Switch */}
      {/*      checked={oidc} */}
      {/*      onChange={({ target: { checked } }) => setOIDC(checked)} */}
      {/*    >Enable OIDC */}
      {/*    </Switch> */}
      {/*  </div> */}
      {/* )} */}
    </Flex>
  )
}
