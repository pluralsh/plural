import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Div, Flex, Img, P } from 'honorable'

import RepositoryContext from '../../contexts/RepositoryContext'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { LoopingLogo } from '../utils/AnimatedLogo'
import InfiniteScroller from '../utils/InfiniteScroller'

import { TERRAFORM_QUERY } from './queries'

const defaultTerraformIcon = `${process.env.PUBLIC_URL}/terraform.png`
const defaultChartIcon = `${process.env.PUBLIC_URL}/chart.png`
const defualtGcpIcon = `${process.env.PUBLIC_URL}/gcp.png`
const defualtAzureIcon = `${process.env.PUBLIC_URL}/azure.png`
const defaultAwsIcon = `${process.env.PUBLIC_URL}/aws-icon.png`
const defaultEquinixIcon = `${process.env.PUBLIC_URL}/equinix-metal.png`
const defaultKindIcon = `${process.env.PUBLIC_URL}/kind.png`

const providerToIcon = {
  GCP: defualtGcpIcon,
  AWS: defaultAwsIcon,
  AZURE: defualtAzureIcon,
  EQUINIX: defaultEquinixIcon,
  KIND: defaultKindIcon,
}

function Terraform({ terraform }) {
  return (
    <Flex
      px={1}
      py={0.5}
      mb={0.5}
      as={Link}
      to={`/terraform/${terraform.id}`}
      color="text"
      textDecoration="none"
      align="center"
      hoverIndicator="fill-one"
      borderRadius={4}
    >
      <Img
        alt={terraform.name}
        width={64}
        height={64}
        src={defaultTerraformIcon}
      />
      <Div ml={1}>
        <Flex align="center">
          <P
            body1
            fontWeight={500}
          >
            {terraform.name}
          </P>
          {terraform.dependencies && terraform.dependencies.providers && (
            <Flex ml={1}>
              {terraform.dependencies.providers.map(provider => (
                <Img
                  key={provider}
                  alt={provider}
                  src={providerToIcon[provider] || defaultChartIcon}
                  width={16}
                />
              ))}
            </Flex>
          )}
        </Flex>
        <P mt={0.5}>
          {terraform.latestVersion} {terraform.description ? `- ${terraform.description}` : null}
        </P>
      </Div>
    </Flex>
  )
}

function RepositoryPackagesTerraform() {
  const { id } = useContext(RepositoryContext)
  const [terraforms, loadingTerraforms, hasMoreTerraforms, fetchMoreTerraforms] = usePaginatedQuery(
    TERRAFORM_QUERY,
    {
      variables: {
        repositoryId: id,
      },
    },
    data => data.terraform
  )

  if (terraforms.length === 0 && loadingTerraforms) {
    return (
      <Flex
        pt={2}
        justify="center"
      >
        <LoopingLogo />
      </Flex>
    )
  }

  return (
    <InfiniteScroller
      loading={loadingTerraforms}
      hasMore={hasMoreTerraforms}
      loadMore={fetchMoreTerraforms}
      // Allow for scrolling in a flexbox layout
      flexGrow={1}
      height={0}
    >
      {terraforms.map(terraform => (
        <Terraform
          key={terraform.id}
          terraform={terraform}
        />
      ))}
    </InfiniteScroller>
  )
}

export default RepositoryPackagesTerraform
