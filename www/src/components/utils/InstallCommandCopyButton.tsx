import { Div, Flex } from 'honorable'
import { CheckIcon, CopyIcon, Tooltip } from '@pluralsh/design-system'
import { useCallback, useEffect, useState } from 'react'

import { SidecarButton } from '../repository/RepositorySideCar'

import {
  RecipeSubset,
  RecipeType,
  getInstallCommand,
  providerToIcon,
  providerToIconWidth,
  providerToShortName,
} from './recipeHelpers'

export function InstallCommandCopyButton({
  name,
  recipe,
  type,
}: {
  name: string
  recipe: RecipeSubset
  type: RecipeType
}) {
  const provider = recipe?.provider
  const [copiedAt, setCopiedAt] = useState<false | number>(false)

  const onClick = useCallback(() => {
    const command = getInstallCommand({ type, name, recipe })

    navigator.clipboard.writeText(command).then(() => {
      setCopiedAt(Date.now)
    })
  }, [name, recipe, type])

  useEffect(() => {
    if (copiedAt) {
      const timeout = setTimeout(() => {
        setCopiedAt(false)
      }, 2000)

      return () => {
        clearTimeout(timeout)
      }
    }
  }, [copiedAt])

  if (!provider) {
    return null
  }

  return (
    <Tooltip
      label="Copy CLI install command"
      placement="bottom"
    >
      <span>
        <SidecarButton
          onClick={onClick}
          width="100%"
          {...{
            '& > *:nth-child(2)': {
              flexGrow: 1,
              justifyContent: 'start',
            },
          }}
          startIcon={
            <Flex
              width={16}
              height={16}
              alignItems="center"
              justifyContent="center"
            >
              <img
                src={providerToIcon[provider]}
                width={providerToIconWidth[provider]}
              />
            </Flex>
          }
          endIcon={copiedAt ? <CheckIcon /> : <CopyIcon />}
        >
          <Div textAlign="left">{providerToShortName[provider]}</Div>
        </SidecarButton>
      </span>
    </Tooltip>
  )
}
