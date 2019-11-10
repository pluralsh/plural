package api

import (
	"fmt"
)

type PageInfo struct {
	HasNextPage bool
	EndCursor string
}

type Publisher struct {
	Id string
	Name string
}

type Repository struct {
	Id string
	Name string
	Publisher Publisher
}

type User struct {
	Id string
	Name string
	Email string
	Publisher Publisher
}

type Chart struct {
	Id string
	Name string
	Description string
	LatestVersion string
}

type ChartInstallation struct {
	Id string
	Chart Chart
	Version Version
	Installation Installation
}

type Version struct {
	Id string
	Version string
	Readme string
	ValuesTemplate string
}

type Terraform struct {
	Id string
	Name string
	Description string
	ValuesTemplate string
}

type TerraformInstallation struct {
	Id string
	Installation Installation
	Terraform Terraform
}

type Installation struct {
	Repository Repository
	User User
}

type InstallationEdge struct {
	Node Installation
}

type ChartEdge struct {
	Node Chart
}

type TerraformEdge struct {
	Node Terraform
}

type VersionEdge struct {
	Node Version
}

type ChartInstallationEdge struct {
	Node ChartInstallation
}

type TerraformInstallationEdge struct {
	Node TerraformInstallation
}

const RepositoryFragment = `
	fragment RepositoryFragment on Repository {
		id
		name
		publisher {
			name
		}
	}
`

var InstallationFragment = fmt.Sprintf(`
	fragment InstallationFragment on Installation {
		id
		repository {
			...RepositoryFragment
		}
	}
	%s
`, RepositoryFragment)

const ChartFragment = `
	fragment ChartFragment on Chart {
		id
		name
		description
		latestVersion
	}
`

const VersionFragment = `
	fragment VersionFragment on Version {
		id
		version
		readme
		valuesTemplate
	}
`

var ChartInstallationFragment = fmt.Sprintf(`
	fragment ChartInstallationFragment on ChartInstallation {
		id
		chart {
			...ChartFragment
		}
		version {
			...VersionFragment
		}
	}
	%s
	%s
`, ChartFragment, VersionFragment)

const TerraformFragment = `
	fragment TerraformFragment on Terraform {
		id
		name
		description
		valuesTemplate
	}
`

var TerraformInstallationFragment = fmt.Sprintf(`
	fragment TerraformInstallationFragment on TerraformInstallation {
		id
		terraform {
			...TerraformFragment
		}
	}
	%s
`, TerraformFragment)