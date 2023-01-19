import { useEffect, useMemo, useState } from 'react'
import { Gitlab } from '@gitbeaker/browser'

import { OrgType, SCMOrg } from '../../../context/types'

// TODO: test this
export function useGitlabState({ token }): Array<SCMOrg> {
  const client = useMemo(() => new Gitlab({ oauthToken: token }), [token])
  const [orgs, setOrgs] = useState<Array<SCMOrg>>()

  useEffect(() => {
    const fetch = async () => {
      const groups = await client.Groups.all({ min_access_level: 30 })
      const me = await client.Users.current()
      const orgs = [
        { type: OrgType.User, data: me, id: me.id },
        ...groups.map(g => ({
          type: OrgType.Organization,
          data: g,
          id: g.id,
        })),
      ]

      setOrgs(orgs.map<SCMOrg>(o => ({
        name: (o.data.path || o.data.username) as string,
        orgType: o.type,
        id: `${o.id}`,
        avatarUrl: o.data.avatar_url,
      })))
    }

    if (!orgs) fetch()
  }, [client, setOrgs, orgs])

  return orgs ?? []
}
