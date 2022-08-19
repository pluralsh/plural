import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Flex } from 'honorable'
import {
  Input,
  MagnifyingGlassIcon, PageTitle, SubTab,
} from 'pluralsh-design-system'
import { useState } from 'react'

export function packageCardStyle(first, last) {
  return {
    backgroundColor: 'fill-one',
    hoverIndicator: 'fill-two',
    color: 'text',
    textDecoration: 'none',
    border: '1px solid border-fill-two',
    borderTop: 'none',
    borderBottomLeftRadius: last ? '4px' : 0,
    borderBottomRightRadius: last ? '4px' : 0,
    align: 'center',
    px: 1,
    py: 0.5,
  }
}

const tabToUrl = {
  'Helm charts': 'helm',
  'Terraform modules': 'terraform',
  'Docker repositories': 'docker',
}

export default function RepositoryPackages() {
  const [q, setQ] = useState('')
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const tabUrl = pathname.substring(pathname.lastIndexOf('/') + 1)

  return (
    <Flex
      direction="column"
      height="100%"
    >
      <PageTitle
        heading="Packages"
        paddingTop="medium"
      >
        <Flex>
          {Object.keys(tabToUrl).map(tab => (
            <SubTab
              active={tabToUrl[tab] === tabUrl}
              onClick={() => navigate(tabToUrl[tab])}
            >
              {tab}
            </SubTab>
          ))}
        </Flex>
      </PageTitle>
      <Input
        value={q}
        onChange={event => setQ(event.target.value)}
        placeholder={`Filter ${Object.keys(tabToUrl).find(key => tabToUrl[key] === tabUrl)}`}
        startIcon={(<MagnifyingGlassIcon size={14} />)}
        width="100%"
        backgroundColor="fill-one"
        borderBottomLeftRadius="0"
        borderBottomRightRadius="0"
      />
      <Flex
        direction="column"
        marginBottom="medium"
        flexGrow={1}
      >
        <Outlet context={[q, setQ]} />
      </Flex>
    </Flex>
  )
}
