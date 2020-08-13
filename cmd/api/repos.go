package api

import (
	"fmt"

	"gopkg.in/yaml.v2"
)

type ResourceDefinitionInput struct {
	Name string
	Spec []Specification
}

type Specification struct {
	Name     string
	Type     string
	Required bool
	Spec     []Specification `json:"spec,omitempty"`
}

type IntegrationInput struct {
	Name        string
	Description string
	Icon        string
	SourceURL   string `json:"sourceUrl,omitempty"`
	Spec        string
	Tags        []Tag `json:"tags,omitempty" yaml:"tags"`
}

type RepositoryInput struct {
	Dashboards []struct {
		Name string
		UID  string `json:"uid"`
	}
}

type ShellInput struct {
	Target  string
	Command string
	Args    []string
}

type DatabaseInput struct {
	Target      string
	Port        int32
	Engine      string
	Name        string
	Credentials CredentialInput
}

type CredentialInput struct {
	User   string
	Secret string
	Key    string
}

const updateRepository = `
	mutation UpdateRepository($name: String!, $input: ResourceDefinitionAttributes!) {
		updateRepository(repositoryName: $name, attributes: {integrationResourceDefinition: $input}) {
			id
		}
	}
`

const createIntegration = `
	mutation CreateIntegration($name: String!, $attrs: IntegrationAttributes!) {
		createIntegration(repositoryName: $name, attributes: $attrs) {
			id
		}
	}
`

const updateRepo = `
	mutation UpdateRepo($name: String!, $attrs: RepositoryAttributes!) {
		updateRepository(repositoryName: $name, attributes: $attrs) {
			id
		}
	}
`

const updateOperations = `
	mutation UpdateRepo($name: String!, $shell: ShellAttributes, $database: DatabaseAttributes) {
		updateRepository(repositoryName: $name, attributes: {shell: $shell, database: $database}) {
			id
		}
	}
`

var getRepo = fmt.Sprintf(`
	query Repo($name: String) {
		repository(name: $name) {
			...RepositoryFragment
		}
	}
	%s
`, RepositoryFragment)

func (client *Client) GetRepository(repo string) (repository *Repository, err error) {
	var resp struct {
		Repository *Repository
	}
	req := client.Build(getRepo)
	req.Var("name", repo)
	err = client.Run(req, &resp)
	repository = resp.Repository
	return
}

func (client *Client) CreateResourceDefinition(repoName string, input ResourceDefinitionInput) (string, error) {
	var resp struct {
		Id string
	}
	req := client.Build(updateRepository)
	req.Var("input", input)
	req.Var("name", repoName)
	err := client.Run(req, &resp)
	return resp.Id, err
}

func (client *Client) CreateIntegration(name string, input IntegrationInput) (string, error) {
	var resp struct {
		Id string
	}
	req := client.Build(createIntegration)
	req.Var("attrs", input)
	req.Var("name", name)
	err := client.Run(req, &resp)
	return resp.Id, err
}

func (client *Client) CreateShell(name string, input ShellInput) (string, error) {
	var resp struct {
		Id string
	}
	req := client.Build(updateOperations)
	req.Var("shell", input)
	req.Var("name", name)
	err := client.Run(req, &resp)
	return resp.Id, err
}

func (client *Client) CreateDatabase(name string, input DatabaseInput) (string, error) {
	var resp struct {
		Id string
	}
	req := client.Build(updateOperations)
	req.Var("database", input)
	req.Var("name", name)
	err := client.Run(req, &resp)
	return resp.Id, err
}

func (client *Client) UpdateRepository(name string, input RepositoryInput) (string, error) {
	var resp struct {
		Id string
	}
	req := client.Build(updateRepo)
	req.Var("attrs", input)
	req.Var("name", name)
	err := client.Run(req, &resp)
	return resp.Id, err
}

func ConstructRepositoryInput(marshalled []byte) (input RepositoryInput, err error) {
	err = yaml.Unmarshal(marshalled, &input)
	return
}

func ConstructShellInput(marshalled []byte) (input ShellInput, err error) {
	err = yaml.Unmarshal(marshalled, &input)
	return
}

func ConstructDatabaseInput(marshalled []byte) (input DatabaseInput, err error) {
	err = yaml.Unmarshal(marshalled, &input)
	return
}

func ConstructResourceDefinition(marshalled []byte) (input ResourceDefinitionInput, err error) {
	err = yaml.Unmarshal(marshalled, &input)
	return
}

func ConstructIntegration(marshalled []byte) (IntegrationInput, error) {
	var intg struct {
		Name        string
		Description string
		Icon        string
		SourceURL   string `yaml:"sourceUrl"`
		Tags        []Tag
		Spec        interface{}
	}
	err := yaml.Unmarshal(marshalled, &intg)
	if err != nil {
		return IntegrationInput{}, err
	}

	str, err := yaml.Marshal(intg.Spec)
	return IntegrationInput{
		Name:        intg.Name,
		Description: intg.Description,
		Icon:        intg.Icon,
		Spec:        string(str),
		Tags:        intg.Tags,
		SourceURL:   intg.SourceURL,
	}, err
}
