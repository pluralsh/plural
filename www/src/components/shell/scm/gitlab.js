import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Gitlab } from '@gitbeaker/node'
import { Box, Text } from 'grommet'

import { isAlphanumeric } from '../validation'

import { OrgInput } from './OrgInput'

export const GITLAB_VALIDATIONS = [
  { field: 'scm.name', name: 'repository', func: isAlphanumeric },
]

function OrgDisplay({ data: { path, username, avatar_url } }) {
  return (
    <Box
      direction="row"
      gap="small"
      align="center"
      pad="small"
    >
      {avatar_url && (
        <img
          src={avatar_url}
          width="25px"
          height="25px"
        />
      )}
      <Text
        size="small"
        weight={500}
      >{path || username}
      </Text>
    </Box>
  )
}

export function GitlabRepositoryInput({ scm, setScm, accessToken }) {
  const client = useMemo(() => new Gitlab({ oauthToken: accessToken }), [accessToken])
  const [orgs, setOrgs] = useState(null)
  const [org, setOrg] = useState(null)
  const doSetOrg = useCallback(org => {
    org.type === 'user' ? setScm({ ...scm, org: null }): setScm({ ...scm, org: `${org.id}` })
    setOrg(org)
  }, [setScm, scm, setOrg])

  useEffect(() => {
    const fetch = async () => {
      const groups = await client.Groups.all({min_access_level: 30})
      const me = await client.Users.current()
      const orgs = [{type: 'user', data: me}, ...groups.map((g) => ({type: 'group', data: g}))]
      setOrgs(orgs)
      doSetOrg(orgs[0])
    }
    if (!orgs) fetch()
  }, [client, setOrgs, orgs, doSetOrg])

  return (
    <Box>
      <OrgInput 
        name={scm.name}
        setName={name => setScm({ ...scm, name })}
        org={org} 
        orgs={orgs} 
        setOrg={doSetOrg}
        render={org => <OrgDisplay org={org} />}
      />
    </Box>
  )
}
