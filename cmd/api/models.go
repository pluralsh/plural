package api

type PageInfo struct {
	HasNextPage bool
	EndCursor string
}

type Publisher struct {
	Name string
}

type Repository struct {
	Name string
}

type User struct {
	Name string
	Email string
	Publisher Publisher
}

type Installation struct {
	Repository Repository
	User User
}

type InstallationEdge struct {
	Node Installation
}

const RepositoryFragment = `
	fragment RepositoryFragment on Repository {
		name
	}
`

const InstallationFragment = `
	fragment InstallationFragment on Installation {
		repository {
			...RepositoryFragment
		}
	}
`