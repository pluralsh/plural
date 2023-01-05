import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Octokit } from '@octokit/core'

import { OrgType } from '../../../context/types'

export function useGithubState({ scm, setSCM }: any) {
  const client = useMemo(() => new Octokit({ auth: scm.token }), [scm])
  const [orgs, setOrgs] = useState<any>(null)
  const [org, setOrg] = useState<any>(null)

  const doSetOrg = useCallback(org => {
    if (org.type === OrgType.User) {
      setSCM({ ...scm, org: null, orgType: OrgType.User })
    }
    else {
      setSCM({ ...scm, org: org.login, orgType: OrgType.Organization })
    }
    setOrg(org)
  }, [scm, setSCM])

  useEffect(() => {
    const fetch = async () => {
      const { data } = await client.request('GET /user/orgs')
      const { data: me } = await client.request('GET /user')
      const mergedOrgs = [me, ...data]

      if (data && me) setOrgs(mergedOrgs)

      const selectedOrg = scm.orgType === OrgType.User ? me : data.find(org => org.login === scm.org) || me

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
