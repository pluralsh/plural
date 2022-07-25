import { useContext, useState } from 'react'
import {
  A, Button, Div, DropdownButton, ExtendTheme, Flex, H2, Img, MenuItem, P,
} from 'honorable'
import {
  ArrowTopRightIcon, CaretDownIcon, Codeline, Tab,
} from 'pluralsh-design-system'
import { Link } from 'react-router-dom'

import RepositoryContext from '../../contexts/RepositoryContext'

import { capitalize } from '../../utils/string'

import { providerToDisplayName, providerToIcon, providerToIconHeight } from './constants'

const visuallyHideMaintainWidth = {
  opacity: '0',
  height: 0,
  'aria-hidden': true,
  pointerEvents: 'none',
}

function extendedTheme({ minMenuWidth = 400 }) {
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
        },
      ],
      Menu: [
        {
          backgroundColor: 'fill-one',
          border: '1px solid border-fill-one',
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

function RecipeMenuItem({ recipe }) {
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

function InstallDropdownButton({ recipes, ...props }) {
  const { name } = useContext(RepositoryContext)
  const [recipe, setRecipe] = useState(null)
  const [tab, setTab] = useState(0)

  function renderTabs() {
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
              Choose either the Plural CLI or cloud shell to install. Learn more about CLI installation in our{' '}
              <A
                inline
                href="https://docs.plural.sh/getting-started/getting-started#install-plural-cli"
                target="_blank"
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
            {...{ '&>div': { justifyContent: 'center' } }}
          >
            Plural CLI
          </Tab>
          <Tab
            active={tab === 1}
            onClick={() => setTab(1)}
            flexGrow={1}
            {...{ '&>div': { justifyContent: 'center' } }}
          >
            Cloud Shell
          </Tab>
        </Flex>
        <Div padding="large">
          <Div {...(tab !== 0 ? visuallyHideMaintainWidth : {})}>
            <P
              body2
              color="text"
            >
              In your installation repository, run:
            </P>
            <Codeline
              marginTop="small"
              language="bash"
            >
              {`plural bundle install ${name} ${recipe.name}`}
            </Codeline>
          </Div>
          <Div {...(tab !== 1 ? visuallyHideMaintainWidth : {})}>
            <Link
              to="/shell"
              style={{ textDecoration: 'none' }}
            >
              <Button width="100%">
                Open Cloud Shell <ArrowTopRightIcon
                  size={24}
                  mt="-6px"
                  position="relative"
                  top={6}
                />
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
            setRecipe(event.target.value)
            setTab(0)
          }}
          endIcon={(
            <CaretDownIcon size={8} />
          )}
          {...props}
        >
          {recipes.map(recipe => (
            <RecipeMenuItem
              key={recipe.id}
              recipe={recipe}
            />
          ))}
        </DropdownButton>
      )}
      {!!recipe && (
        <DropdownButton
          fade
          defaultOpen
          onOpen={x => {
            if (!x) setRecipe(null)
          }}
          label="Install"
          onChange={() => {
            setRecipe(null)
            setTab(0)
          }}
          {...props}
        >
          {renderTabs()}
        </DropdownButton>
      )}
    </ExtendTheme>
  )
}

export default InstallDropdownButton
