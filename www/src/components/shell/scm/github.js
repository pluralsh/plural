import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Octokit } from "@octokit/core";
import { Box, Text } from 'grommet';
import { OrgInput } from './OrgInput';

function OrgDisplay({org: {login, avatar_url}}) {
  return (
    <Box direction='row' gap='small' align='center' pad='small'>
      {avatar_url && <img src={avatar_url} width='25px' height='25px' />}
      <Text size='small' weight={500}>{login}</Text>
    </Box>
  )
}

export function GithubRepositoryInput({scm, setScm, accessToken}) {
  const client = useMemo(() => new Octokit({auth: accessToken}), [accessToken])
  const [orgs, setOrgs] = useState(null)
  const [org, setOrg] = useState(null)
  const doSetOrg = useCallback((org) => {
    if (org.type === 'User') {
      setScm({...scm, org: null})
    } else {
      setScm({...scm, org: org.login})
    }
    setOrg(org)
  }, [setScm, scm, setOrg])

  useEffect(() => {
    const fetch = async () => {
      const {data} = await client.request('GET /user/orgs')
      const {data: me} = await client.request('GET /user')
      if (data) setOrgs([me, ...data])
      if (data.length > 0) {
        doSetOrg(data[0])
      } else {
        doSetOrg(me)
      }
    }
    if (!orgs) fetch()
  }, [client, setOrgs, orgs, doSetOrg])

  console.log(scm)

  return (
    <Box>
      <OrgInput 
        name={scm.name}
        setName={(name) => setScm({...scm, name})}
        org={org} 
        orgs={orgs} 
        setOrg={doSetOrg}
        render={(org) => <OrgDisplay org={org} />} />
    </Box>
  )
}