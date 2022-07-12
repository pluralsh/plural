import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Flex } from 'honorable'

import { ButtonGroup } from '../utils/ButtonGroup'

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

function RepositoryPackages() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const currentPath = pathname.substring(pathname.lastIndexOf('/') + 1)
  const defaultTab = Object.keys(tabToUrl).find(key => tabToUrl[key] === currentPath)
  const changeTab = tab => navigate(tabToUrl[tab])

  return (
    <Flex
      direction="column"
      height="100%"
    >
      <Flex justifyContent="flex-end">
        <ButtonGroup
          tabs={Object.keys(tabToUrl)}
          default={defaultTab}
          onChange={changeTab}
        />
      </Flex>
      <Flex
        mt={1}
        direction="column"
        flexGrow={1}
      >
        <Outlet />
      </Flex>
    </Flex>
  )
}

export default RepositoryPackages
