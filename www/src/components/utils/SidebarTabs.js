import { Div, Flex } from 'honorable'
import { Tab } from 'pluralsh-design-system'

export function SidebarTabs({ width = 250, children }) {
  return (
    <Flex
      px={1}
      py={1}
      width={width}
      flexShrink={0}
      direction="column"
    >
      <Div
        pt={1}
        borderRight="1px solid border"
      />
      { children }
      <Div
        flexGrow={1}
        borderRight="1px solid border"
      />
    </Flex>
  )
}

export function Tabs({ tabs, tab, setTab }) {
  return (
    <Flex>
      {tabs.map(t => (
        <Tab
          key={t}
          onClick={() => setTab(t)}
          active={t === tab}
        >{t}
        </Tab>
      ))}
      <Div
        flexGrow={1}
        borderBottom="1px solid border"
      />
    </Flex>
  )
}
