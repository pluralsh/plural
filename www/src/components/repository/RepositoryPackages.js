import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Flex } from 'honorable'

import { useState } from 'react'
import { Input, MagnifyingGlassIcon } from 'pluralsh-design-system'

import { ButtonGroup } from '../utils/ButtonGroup'

import RepositoryHeader from './RepositoryHeader.tsx'

export function packageCardStyle(first, last) {
  return {
    backgroundColor: 'fill-one',
    hoverIndicator: 'fill-two',
    color: 'text',
    textDecoration: 'none',
    border: '1px solid border-fill-two',
    borderTop: first ? '1px solid border-fill-two' : 'none',
    borderTopLeftRadius: first ? '4px' : 0,
    borderTopRightRadius: first ? '4px' : 0,
    borderBottomLeftRadius: last ? '4px' : 0,
    borderBottomRightRadius: last ? '4px' : 0,
    align: 'center',
    px: 1,
    py: 0.5,
  }
}

const tabToUrl = {
  'Helm Charts': 'helm',
  'Terraform Modules': 'terraform',
  'Docker Repositories': 'docker',
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
      <RepositoryHeader>Packages</RepositoryHeader>
      <Flex
        justifyContent="space-between"
        paddingTop="medium"
      >
        <Input
          flexBasis="350px"
          marginRight="medium"
          startIcon={(
            <MagnifyingGlassIcon
              size={14}
            />
          )}
          placeholder="Search a package"
          value={q}
          onChange={event => setQ(event.target.value)}
        />
        <ButtonGroup
          tabs={Object.keys(tabToUrl)}
          default={Object.keys(tabToUrl).find(tab => tabToUrl[tab] === tabUrl) || 'Helm Charts'}
          onChange={tab => navigate(tabToUrl[tab])}
        />
      </Flex>
      <Flex
        mt={1}
        direction="column"
        flexGrow={1}
      >
        <Outlet context={[q, setQ]} />
      </Flex>
    </Flex>
  )
}
