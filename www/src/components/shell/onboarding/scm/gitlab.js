import { useCallback, useEffect, useMemo, useState } from 'react'
import { Gitlab } from '@gitbeaker/browser'

import { isValidGitlabName } from '../../validation'

export const GITLAB_VALIDATIONS = [
  { field: 'scm.name', name: 'repository', func: isValidGitlabName },
]

export function useGitlabState({ scm, setScm, accessToken }) {
  const client = useMemo(() => new Gitlab({ oauthToken: accessToken }), [accessToken])
  const [orgs, setOrgs] = useState(null)
  const [org, setOrg] = useState(null)
  const doSetOrg = useCallback(org => {
    if (org.type === 'user') {
      setScm({ ...scm, org: null })
    }
    else {
      setScm({ ...scm, org: `${org.id}` })
    }

    setOrg(org)
  }, [setScm, scm, setOrg])

  useEffect(() => {
    const fetch = async () => {
      const groups = await client.Groups.all({ min_access_level: 30 })
      const me = await client.Users.current()
      const orgs = [
        {
          type: 'user', data: me, id: me.id,
        },
        ...groups.map(g => ({
          type: 'group',
          data: g,
          id: g.id,
        })),
      ]
      setOrgs(orgs)
      doSetOrg(orgs[0])
    }
    if (!orgs) fetch()
  }, [client, setOrgs, orgs, doSetOrg])

  return {
    org,
    orgs,
    doSetOrg,
  }
}
