import {
  ReactElement,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Chip,
  LoopingLogo,
  WizardStep,
  useActive,
} from '@pluralsh/design-system'
import { Box } from 'grommet'
import { Div, Span } from 'honorable'
import { useQuery } from '@apollo/client'

import { RECIPES_QUERY } from '../../../../repository/queries'
import { RECIPE_Q } from '../../../../repos/queries'
import { Recipe } from '../../../../../generated/graphql'

import { Configuration } from './Configuration'

interface StepData {
  id: string | undefined,
  oidc: boolean,
  context: Record<string, unknown>
}

export function Application({ provider, ...props }: any): ReactElement {
  const { active, setData } = useActive<StepData>()
  const [context, setContext] = useState<Record<string, unknown>>(active.data?.context || {})
  const [oidc, setOIDC] = useState(active.data?.oidc || false)
  const [valid, setValid] = useState(true)
  const { data: { recipes: { edges: recipeEdges } = { edges: undefined } } = {} } = useQuery(RECIPES_QUERY, {
    variables: { repositoryId: active.key },
  })

  const { node: recipeBase } = recipeEdges?.find(({ node }) => node.provider === provider) || { node: undefined }
  const { data: recipe } = useQuery<{recipe: Recipe}>(RECIPE_Q, {
    variables: { id: recipeBase?.id },
    skip: !recipeBase,
  })

  const stepData = useMemo(() => ({
    ...active.data, ...{ id: recipe?.recipe.id }, ...{ oidc }, ...{ context },
  }), [active.data, oidc, recipe?.recipe.id, context])

  useEffect(() => {
    const valid = Object.values<any>(context).every(({ valid }) => valid)

    setValid(valid)
  }, [context, setValid])

  // Update step data on change
  useEffect(() => setData(stepData), [stepData, setData])

  if (!recipe) {
    return (
      <WizardStep {...props}>
        <Box
          overflow="hidden"
          fill="vertical"
          justify="center"
        >
          {/* @ts-expect-error */}
          <LoopingLogo overflow="hidden" />
        </Box>
      </WizardStep>
    )
  }

  if (recipe.recipe?.restricted) {
    return (
      <WizardStep
        valid={false}
        {...props}
      >
        <Div
          marginTop="xxsmall"
          marginBottom="medium"
          display="flex"
          gap="medium"
          flexDirection="column"
        >
          <Span
            color="text-xlight"
            overline
          >Cannot install app
          </Span>
          <Span
            color="text-light"
            body2
          >This application has been marked restricted because it requires configuration, like ssh keys, that are only able to be securely configured locally.
          </Span>
        </Div>
      </WizardStep>
    )
  }

  return (
    <WizardStep
      valid={valid}
      data={stepData}
      {...props}
    >
      <Div
        marginBottom="medium"
        display="flex"
        lineHeight="24px"
        alignItems="center"
        height="24px"
      >
        <Span
          overline
          color="text-xlight"
        >
          configure {active.label}
        </Span>
        {active.isDependency && (
          <Chip
            size="small"
            hue="lighter"
            marginLeft="xsmall"
          >Dependency
          </Chip>
        )}
      </Div>
      <Configuration
        recipe={recipe.recipe}
        context={context}
        oidc={oidc}
        setContext={setContext}
        setOIDC={setOIDC}
      />
    </WizardStep>
  )
}
