import { useContext, useState } from 'react'
import { A, Button, Div, DropdownButton, ExtendTheme, Flex, Img, MenuItem, P } from 'honorable'
import { ArrowTopRightIcon, Tab } from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext'

import { capitalize } from '../../utils/string'

import Code from '../utils/Code'

import { providerToDisplayName, providerToIcon, providerToIconHeight } from './constants'

const extendedTheme = {
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
        borderRadius: 'normal',
        width: 400,
        left: 'unset',
      },
    ],
  },
}

function InstallDropdownButton({ recipes, ...props }) {
  const { name } = useContext(RepositoryContext)
  const [recipe, setRecipe] = useState(null)
  const [tab, setTab] = useState(0)

  function renderList() {
    return recipes.map(recipe => (
      <MenuItem
        key={recipe.id}
        value={recipe}
      >
        <Flex>
          <Flex
            align="center"
            justify="center"
            width={2 * 16}
            flexShrink={0}
          >
            <Img
              alt={recipe.name}
              src={providerToIcon[recipe.provider]}
              height={1.5 * providerToIconHeight[recipe.provider]}
            />
          </Flex>
          <Div
            ml={1}
            flexShrink={0}
            flexGrow={1}
            flexBasis="calc(100% - 4 * 16px)"
          >
            <P fontWeight={500}>
              {providerToDisplayName[recipe.provider]}
            </P>
            <P
              wordBreak="break-word"
            >
              {capitalize(recipe.description)}
            </P>
          </Div>
        </Flex>
      </MenuItem>
    ))
  }

  function renderTabs() {
    return (
      <Div>
        <Div
          pt={0.5}
          px={1}
        >
          <P
            overline
            fontSize={12}
            color="text-xlight"
          >
            Install on {providerToDisplayName[recipe.provider]}
          </P>
          <P>
            Choose either the Plural CLI or cloud shell to install. Learn more about CLI installation in our <A href="#">docs</A>.
          </P>
        </Div>
        <Flex mt={0.5}>
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
        <Div p={1}>
          {tab === 0 && (
            <>
              <P>
                In your installation repository, run:
              </P>
              <Code
                mt={0.5}
                language="bash"
              >
                {`plural bundle install ${name} ${recipe.name}`}
              </Code>
            </>
          )}
          {tab === 1 && (
            <Button width="100%">
              Open Cloud Shell <ArrowTopRightIcon
                size={24}
                mt="-6px"
                position="relative"
                top={6}
              />
            </Button>
          )}
        </Div>

      </Div>
    )
  }

  return (
    <ExtendTheme theme={extendedTheme}>
      {!recipe && (
        <DropdownButton
          fade
          label="Install"
          onChange={event => {
            setRecipe(event.target.value)
            setTab(0)
          }}
          {...props}
        >
          {renderList()}
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
