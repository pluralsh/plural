import { useState } from 'react'
import {
  A,
  Button,
  Div,
  DropdownButton,
  ExtendTheme,
  Flex,
  H2,
  Img,
  MenuItem,
  P,
} from 'honorable'
import {
  ArrowTopRightIcon,
  Codeline,
  DropdownArrowIcon,
  Tab,
} from '@pluralsh/design-system'
import { Link } from 'react-router-dom'
import capitalize from 'lodash/capitalize'

import { Github as GithubLogo, Gitlab as GitlabLogo } from '../shell/icons'

export interface Recipe {
  name: string
  description: string
  provider: string
}

export const providerToDisplayName = {
  AWS: 'Amazon Web Services',
  AZURE: 'Azure',
  EQUINIX: 'Equinix Metal',
  GCP: 'Google Cloud Platform',
  KIND: 'Kind',
}

export const providerToIcon = {
  AWS: '/aws-icon.png',
  AZURE: '/azure.png',
  EQUINIX: '/equinix-metal.png',
  GCP: '/gcp.png',
  KIND: '/kind.png',
}

export const providerToIconHeight = {
  AWS: 11,
  AZURE: 14,
  EQUINIX: 16,
  GCP: 14,
  KIND: 14,
}

export const providerToLogo = {
  github: <GithubLogo width={40} />,
  gitlab: <GitlabLogo width={40} />,
}

const visuallyHideMaintainWidth = {
  opacity: '0',
  height: 0,
  'aria-hidden': true,
  pointerEvents: 'none',
}

function extendedTheme({ minMenuWidth = 400 }: any) {
  return {
    A: {
      Root: [
        {
          color: 'action-link-inline',
        },
      ],
    },
    DropdownButton: {
      Button: [
        {
          borderRadius: 'normal',
          width: '100%',
        },
      ],
      Menu: [
        {
          backgroundColor: 'fill-two',
          border: '1px solid border-fill-two',
          borderRadius: 'large',
          width: 'max-content',
          minWidth: minMenuWidth,
          maxWidth: 1000,
          left: 'unset',
          marginTop: 'xsmall',
          boxShadow: 'moderate',
        },
      ],
    },
  }
}

function RecipeMenuItem({ recipe }: { recipe: Recipe }) {
  return (
    <MenuItem
      value={recipe}
      _hover={{ backgroundColor: 'fill-one-hover' }}
    >
      <Flex>
        <Flex
          align="center"
          justify="center"
          width={40}
          height={40}
          flexShrink={0}
          marginRight="medium"
        >
          <Img
            alt={recipe.name}
            src={providerToIcon[recipe.provider]}
            height={2.0 * providerToIconHeight[recipe.provider]}
          />
        </Flex>
        <Div
          flexShrink={1}
          flexGrow={1}
          flexBasis="calc(100% - 4 * 16px)"
        >
          <P
            fontSize="14"
            fontWeight="600"
          >
            {providerToDisplayName[recipe.provider]}
          </P>
          <P
            caption
            wordBreak="break-word"
          >
            {capitalize(recipe.description)}
          </P>
        </Div>
      </Flex>
    </MenuItem>
  )
}

type InstallDropDownButtonProps = {
  recipes: Recipe[],
  name?: string,
  type?: string,
  [x: string]: any
}

function InstallDropdownButton({
  recipes,
  name,
  type = 'bundle',
  ...props
} : InstallDropDownButtonProps) {
  const [recipe, setRecipe] = useState<Recipe>()
  const [tab, setTab] = useState(0)

  function renderTabs() {
    if (!recipe) return

    return (
      <Div>
        <Div
          padding="large"
          paddingBottom="medium"
        >
          <Flex
            align="center"
            marginBottom="xxsmall"
          >
            <Img
              alt={recipe.name}
              src={providerToIcon[recipe.provider]}
              height={1.15 * providerToIconHeight[recipe.provider]}
              marginRight="small"
            />
            <H2
              overline
              color="text-xlight"
            >
              Install on {providerToDisplayName[recipe.provider]}
            </H2>
          </Flex>
          <Flex>
            <P
              body1
              color="text-light"
              width="min-content"
              maxWidth="100%"
              flexGrow={1}
            >
              {recipe.provider !== 'KIND' && <>Choose either the Plural CLI or cloud shell to install. </>}
              Learn more about CLI installation in our{' '}
              <A
                inline
                href="https://docs.plural.sh/getting-started/getting-started#install-plural-cli"
                target="_blank"
                textDecoration="none"
              >
                docs
              </A>.
            </P>
          </Flex>
        </Div>
        <Flex marginTop="xsmall">
          <Tab
            active={tab === 0}
            onClick={() => setTab(0)}
            flexGrow={1}
            borderBottom={tab === 0 ? '1px solid border-primary' : '1px solid border-fill-two'}
            {...{ '&>div': { justifyContent: 'center' } }}
          >
            Plural CLI
          </Tab>
          {recipe.provider !== 'KIND' && (
            <Tab
              active={tab === 1}
              onClick={() => setTab(1)}
              flexGrow={1}
              borderBottom={tab === 1 ? '1px solid border-primary' : '1px solid border-fill-two'}
              {...{ '&>div': { justifyContent: 'center' } }}
            >
              Cloud Shell
            </Tab>
          )}

        </Flex>
        <Div padding="large">
          <Div {...(tab !== 0 ? visuallyHideMaintainWidth : {})}>
            <P
              body2
              color="text"
              marginBottom="small"
            >
              In your installation repository, run:
            </P>
            <Codeline
              language="bash"
            >{`plural ${type} install ${name} ${recipe.name || ''}`}
            </Codeline>
          </Div>
          <Div {...(tab !== 1 ? visuallyHideMaintainWidth : {})}>
            {type !== 'stack' && (
              <Div>
                <P
                  body2
                  color="text"
                  marginBottom="xsmall"
                >
                  Copy this command:
                </P>
                <Codeline
                  language="bash"
                >{`plural ${type} install ${name} ${recipe.name || ''}`}
                </Codeline>
                <P
                  body2
                  color="text"
                  marginTop="large"
                  marginBottom="xsmall"
                >
                  Open in cloud shell and paste command:
                </P>
              </Div>
            )}
            <Link
              to={type === 'stack' ? `/shell?stackName=${name}&stackProvider=${recipe.provider}` : `/shell?appName=${name}`}
              style={{ textDecoration: 'none' }}
            >
              <Button
                width="100%"
                endIcon={<ArrowTopRightIcon />}
              >
                {type === 'stack' ? 'Install on Cloud Shell' : 'Open Cloud Shell'}
              </Button>
            </Link>
          </Div>
        </Div>
      </Div>
    )
  }

  return (
    <ExtendTheme theme={extendedTheme({ minMenuWidth: !recipe ? 300 : 470 })}>
      {!recipe && (
        <DropdownButton
          fade
          label="Install"
          onChange={event => {
            setRecipe((event.target as any).value)
            setTab(0)
          }}
          endIcon={(
            <DropdownArrowIcon size={16} />
          )}
          {...props}
        >
          {recipes.map((recipe, i) => (
            <RecipeMenuItem
              key={i}
              recipe={recipe}
            />
          ))}
        </DropdownButton>
      )}
      {!!recipe && (
        <DropdownButton
          fade
          defaultOpen
          onOpen={open => {
            if (!open) setRecipe(undefined)
          }}
          label="Install"
          onChange={() => {
            setRecipe(undefined)
            setTab(0)
          }}
          endIcon={(
            <DropdownArrowIcon size={16} />
          )}
          {...props}
        >
          {renderTabs()}
        </DropdownButton>
      )}
    </ExtendTheme>
  )
}

export default InstallDropdownButton
