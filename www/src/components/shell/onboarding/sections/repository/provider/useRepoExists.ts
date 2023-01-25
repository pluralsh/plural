import { useEffect, useMemo, useState } from 'react'
import { Octokit } from '@octokit/core'

import { SCMOrg } from '../../../context/types'
import { ScmProvider } from '../../../../../../generated/graphql'

enum ResponseCode {
  NotFound = 404,
  Ok = 200
}

interface ErrorResponse {
  name: string
  status: ResponseCode,
  message: string
}

async function isRepoNameUsed(client, owner, name) {
  try {
    const response = await client.request(`GET /repos/${owner}/${name}`)

    return response.status === ResponseCode.Ok
  }
  catch (err) {
    const error = err as ErrorResponse

    if (error.status === ResponseCode.NotFound) return false
  }

  return false
}

function useRepoExists(
  token, org: SCMOrg | undefined, name: string | undefined, provider: ScmProvider
) {
  const delay = 750
  const client = useMemo(() => new Octokit({ auth: token }), [token])
  const [loading, setLoading] = useState(false)
  const [validated, setValidated] = useState(false)
  const [exists, setExists] = useState(false)

  useEffect(() => {
    setExists(false)
    setValidated(false)

    if (!name || name.length < 1 || provider !== ScmProvider.Github) return

    const handler = setTimeout(() => {
      setLoading(true)
      isRepoNameUsed(client, org?.name, name).then(exists => setExists(exists)).finally(() => {
        setLoading(false)
        setValidated(true)
      })
    }, delay)

    return () => clearTimeout(handler)
  }, [client, name, org?.name, provider])

  return provider === ScmProvider.Github ? { loading, exists, validated } : { loading: false, exists: false, validated: true }
}

export { useRepoExists }
