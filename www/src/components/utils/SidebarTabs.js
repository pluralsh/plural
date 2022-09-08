import { Div, Flex } from 'honorable'
import { Tab } from 'pluralsh-design-system'

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
