import { Link, Outlet, useLocation } from 'react-router-dom'
import { Div, Flex, H2 } from 'honorable'

function RepositoryPackagesTab({ to, label, active }) {
  const hoverStyle = {
    '&:hover': {
      backgroundColor: 'fill-one',
    },
  }

  return (
    <Div
      as={Link}
      to={to}
      px={1}
      pt={0.333}
      pb={0.25}
      mr={1}
      color="text"
      textDecoration="none"
      fontWeight={600}
      borderTopLeftRadius={4}
      borderTopRightRadius={4}
      borderBottom={`2px solid ${active ? 'primary' : 'transparent'}`}
      {...hoverStyle}
    >
      {label}
    </Div>
  )
}

function RepositoryPackages() {
  const { pathname } = useLocation()

  return (
    <Flex
      direction="column"
      height="100%"
    >
      <H2>
        Packages
      </H2>
      <Flex
        mt={2}
        borderBottom="1px solid border"
      >
        <RepositoryPackagesTab
          label="Helm Charts"
          to="helm"
          active={pathname.endsWith('helm')}
        />
        <RepositoryPackagesTab
          label="Terraform Modules"
          to="terraform"
          active={pathname.endsWith('terraform')}
        />
        <RepositoryPackagesTab
          label=" Docker Repositories"
          to="docker"
          active={pathname.endsWith('docker')}
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
