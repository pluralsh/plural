import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Octokit } from '@octokit/core'

function useGithubState({ scm, setScm, accessToken }) {
  const client = useMemo(() => new Octokit({ auth: accessToken }), [accessToken])
  const [orgs, setOrgs] = useState<any>(null)
  const [org, setOrg] = useState(null)

  const doSetOrg = useCallback(org => {
    if (org.type === 'User') {
      setScm({ ...scm, org: null })
    }
    else {
      setScm({ ...scm, org: org.login })
    }
    setOrg(org)
  }, [setScm, scm, setOrg])

  useEffect(() => {
    const fetch = async () => {
      const { data } = await client.request('GET /user/orgs')
      const { data: me } = await client.request('GET /user')

      if (data) setOrgs([me, ...data])
      if (data.length > 0) {
        doSetOrg(data[0])
      }
      else {
        doSetOrg(me)
      }
    }

    if (!orgs) fetch()
  }, [client, setOrgs, orgs, doSetOrg])

  return {
    org,
    orgs,
    doSetOrg,
  }
}

export default useGithubState
