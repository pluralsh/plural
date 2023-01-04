import { Octokit } from '@octokit/core'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { IssueType } from './types'
import { LABEL_REQUEST, LABEL_ROADMAP } from './constants'

const perPage = 100 // Max is 100

function castIssues(rawIssues: any[]): IssueType[] {
  return rawIssues
    .map(issue => ({
      id: issue.id ?? '',
      title: issue.title ?? '',
      url: issue.html_url ?? '',
      body: issue.body ?? '',
      author: issue.user?.login ?? '',
      state: issue.state ?? '',
      votes: issue.reactions.total_count,
      labels: issue.labels?.map((label: any) => label.name) ?? [],
      isPullRequest: !!issue.pull_request,
      createdAt: issue.created_at ?? '',
    }))
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
}

function useRoadmapData() {
  const [pluralIssues, setPluralIssues] = useState<any[]>([])
  const [pluralArtifactsIssues, setPluralArtifactsIssues] = useState<any[]>([])
  const [pagePlural, setPagePlural] = useState(0)
  const [pagePluralArtifacts, setPagePluralArtifacts] = useState(0)
  const [hasMorePlural, setHasMorePlural] = useState(false)
  const [hasMorePluralArtifacts, setHasMorePluraArtifacts] = useState(false)

  const ockokit = useMemo(() => new Octokit(), [])

  const getPluralIssues = useCallback(async () => {
    const response1 = await ockokit.request(`GET /repos/{owner}/{repo}/issues?labels=${LABEL_ROADMAP}&state=all&page=${pagePlural}&per_page=${perPage}`, {
      owner: 'pluralsh',
      repo: 'plural',
    })
    const response2 = await ockokit.request(`GET /repos/{owner}/{repo}/issues?labels=${LABEL_REQUEST}&state=all&page=${pagePlural}&per_page=${perPage}`, {
      owner: 'pluralsh',
      repo: 'plural',
    })

    setPluralIssues(x => [...x, ...response1.data, ...response2.data])
    setHasMorePlural(response1.data.length >= perPage || response2.data.length >= perPage)
  }, [ockokit, pagePlural])

  const getPluralArtifactsIssues = useCallback(async () => {
    const response1 = await ockokit.request(`GET /repos/{owner}/{repo}/issues?labels=${LABEL_ROADMAP}&state=all&page=${pagePluralArtifacts}&per_page=${perPage}`, {
      owner: 'pluralsh',
      repo: 'plural-artifacts',
    })
    const response2 = await ockokit.request(`GET /repos/{owner}/{repo}/issues?labels=${LABEL_REQUEST}&state=all&page=${pagePluralArtifacts}&per_page=${perPage}`, {
      owner: 'pluralsh',
      repo: 'plural-artifacts',
    })

    setPluralArtifactsIssues(x => [...x, ...response1.data, ...response2.data])
    setHasMorePluraArtifacts(response1.data.length >= perPage || response2.data.length >= perPage)
  }, [ockokit, pagePluralArtifacts])

  useEffect(() => {
    getPluralIssues()
    getPluralArtifactsIssues()
  }, [getPluralIssues, getPluralArtifactsIssues])

  useEffect(() => {
    if (hasMorePlural) setPagePlural(x => x + 1)
  }, [hasMorePlural])

  useEffect(() => {
    if (hasMorePluralArtifacts) setPagePluralArtifacts(x => x + 1)
  }, [hasMorePluralArtifacts])

  return {
    pluralIssues: castIssues(pluralIssues),
    pluralArtifactsIssues: castIssues(pluralArtifactsIssues),
  }
}

export default useRoadmapData
