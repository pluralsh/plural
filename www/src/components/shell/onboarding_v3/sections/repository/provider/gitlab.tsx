import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Gitlab } from '@gitbeaker/browser'

import { OrgType } from '../../../context/types'

// TODO: test this
export function useGitlabState({ scm, setSCM }: any) {
  const client = useMemo(() => new Gitlab({ oauthToken: scm.token }), [scm])
  const [orgs, setOrgs] = useState<any>(null)
  const [org, setOrg] = useState<any>(null)
  const doSetOrg = useCallback(org => {
    if (org.type === 'user') {
      setSCM({ ...scm, org: null, orgType: OrgType.User })
    }
    else {
      setSCM({ ...scm, org: `${org.id}`, orgType: OrgType.Organization })
    }

    setOrg(org)
  }, [scm, setSCM])

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
      const selectedOrg = scm.orgType === OrgType.User ? me : orgs.find(org => org.id === scm.org) || me

      setOrgs(orgs)
      doSetOrg(selectedOrg)
    }

    if (!orgs) fetch()
  }, [client, setOrgs, orgs, doSetOrg, scm])

  return {
    org,
    orgs,
    doSetOrg,
  }
}
