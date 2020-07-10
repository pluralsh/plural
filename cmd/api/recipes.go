package api

import (
	"gopkg.in/yaml.v2"
)

type RecipeInput struct {
	Name         string
	Description  string
	Provider     string
	Sections     []RecipeSectionInput
	Dependencies []DependencyInput
}

type DependencyInput struct {
	Name string
	Repo string
}

type RecipeSectionInput struct {
	Name  string
	Items []RecipeItemInput
}

type RecipeItemInput struct {
	Name          string
	Type          string
	Configuration []ConfigurationItemInput
}

type ConfigurationItemInput struct {
	Name          string
	Default       string
	Type          string
	Documentation string
	Placeholder   string
}

const createRecipe = `
	mutation CreateRecipe($name: String!, $attributes: RecipeAttributes!) {
		createRecipe(repositoryName: $name, attributes: $attributes) {
			id
		}
	}
`

func (client *Client) CreateRecipe(repoName string, attrs RecipeInput) (string, error) {
	var resp struct {
		Id string
	}
	req := client.Build(createRecipe)
	req.Var("attributes", attrs)
	req.Var("name", repoName)
	err := client.Run(req, &resp)
	return resp.Id, err
}

func ConstructRecipe(marshalled []byte) (RecipeInput, error) {
	var recipe RecipeInput
	err := yaml.Unmarshal(marshalled, &recipe)
	return recipe, err
}
