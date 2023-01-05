export type IssueType = {
  id: string
  title: string
  url: string
  body: string
  author: string
  state: string
  labels: string[]
  votes: number
  isPullRequest: boolean
  createdAt: string
}
