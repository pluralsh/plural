import { useContext, useState } from 'react'
import { Div, DropdownButton, ExtendTheme, Flex, H2, Img, MenuItem, Modal, P } from 'honorable'

import RepositoryContext from '../../contexts/RepositoryContext'

import { capitalize } from '../../utils/string'

import { providerToDisplayName, providerToIcon, providerToIconHeight } from './constants'

const extendedTheme = {
  DropdownButton: {
    Button: [
      {
        borderRadius: 'normal',
      },
    ],
    Menu: [
      {
        borderRadius: 'normal',
        width: 360,
        left: 'unset',
      },
    ],
  },
}

function InstallDropdownButton({ recipes, ...props }) {
  const { name } = useContext(RepositoryContext)
  const [open, setOpen] = useState(false)
  const [recipe, setRecipe] = useState(null)
  const [tab, setTab] = useState(0)

  // function renderModalContent() {
  //   if (!recipe) return null

  //   return (
  //     <Div minWidth={512}>
  //       <Flex
  //         align="center"
  //         as={H2}
  //       >
  //         Install {capitalize(name)} on {providerToDisplayName[recipe.provider]}
  //         <Img
  //           ml={0.75}
  //           alt={recipe.name}
  //           src={providerToIcon[recipe.provider]}
  //           height={1.5 * providerToIconHeight[recipe.provider]}
  //         />
  //       </Flex>
  //       <P mt={2}>
  //         {capitalize(recipe.description)}.
  //       </P>
  //       <P mt={1}>
  //         In your installation repository run:
  //       </P>
  //       <Code
  //         language="bash"
  //         mt={2}
  //       >
  //         {`plural bundle install ${name} ${recipe.name}`}
  //       </Code>
  //     </Div>
  //   )
  // }

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
      <Div p={0.5}>
        Foo
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
