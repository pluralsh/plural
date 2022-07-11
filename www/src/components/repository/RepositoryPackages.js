import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Flex } from 'honorable'

import { ButtonGroup } from '../utils/ButtonGroup'

function RepositoryPackages() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const tabToUrl = {
    'Helm Charts': 'helm',
    'Terraform Modules': 'terraform',
    'Docker Repositories': 'docker',
  }
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
