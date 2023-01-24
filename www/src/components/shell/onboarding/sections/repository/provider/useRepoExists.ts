import { useEffect, useMemo, useState } from 'react'
import { Octokit } from '@octokit/core'

import { OrgType, SCMOrg } from '../../../context/types'
import { ScmProvider } from '../../../../../../generated/graphql'

function useRepoExists(
  token, org: SCMOrg | undefined, name: string | undefined, provider: ScmProvider
) {
  const client = useMemo(() => new Octokit({ auth: token }), [token])
  const [repositories, setRepositories] = useState<Set<string>>(new Set<string>())
  const [loading, setLoading] = useState(false)
  const endpoint = useMemo(() => (org && org.orgType === OrgType.Organization ? `GET /orgs/${org.name}/repos` : 'GET /user/repos'), [org])

  useEffect(() => {
    setLoading(true)

    const load = async () => {
      const { data: repositories } = await client.request(endpoint)

      setRepositories(new Set(repositories.map(repository => repository.name)))
      setLoading(false)
    }

    load()
  }, [client, endpoint])

  return provider === ScmProvider.Github ? { loading, exists: repositories.has(name || '') } : { loading: false, exists: false }
}

export { useRepoExists }
