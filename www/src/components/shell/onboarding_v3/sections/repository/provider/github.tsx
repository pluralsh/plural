import { useEffect, useMemo, useState } from 'react'
import { Octokit } from '@octokit/core'

import { OrgType, SCMOrg } from '../../../context/types'

export function useGithubState({ token }): Array<SCMOrg> {
  const client = useMemo(() => new Octokit({ auth: token }), [token])
  const [orgs, setOrgs] = useState<Array<SCMOrg>>([])

  useEffect(() => {
    const fetch = async () => {
      const { data } = await client.request('GET /user/orgs')
      const { data: me } = await client.request('GET /user')

      setOrgs([me, ...data].map<SCMOrg>(o => ({
        name: o.login,
        orgType: o.type === OrgType.User ? OrgType.User : OrgType.Organization,
        id: `${o.id}`,
        avatarUrl: o.avatar_url,
      })))
    }

    if (orgs.length === 0) fetch()
  }, [client, setOrgs, orgs])

  return orgs
}
