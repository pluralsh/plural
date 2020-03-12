defmodule Watchman.Forge.Queries do
  @dashboard_fragment """
    fragment DashboardFragment on Dashboard {
      name
      uid
    }
  """

  @repository_fragment """
    fragment RepositoryFragment on Repository {
      id
      name
      icon
      description
      dashboards {
        ...DashboardFragment
      }
    }
    #{@dashboard_fragment}
  """

  @installation_fragment """
    fragment InstallationFragment on Installation {
      id
      repository {
        ...RepositoryFragment
      }
    }
    #{@repository_fragment}
  """

  @installation_query """
    query Installations($first: Int!, $cursor: String) {
      installations(first: $first, after: $cursor) {
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          node {
            ...InstallationFragment
          }
        }
      }
    }
    #{@installation_fragment}
  """

  def installation_query(), do: @installation_query
end