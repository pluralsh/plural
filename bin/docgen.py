#!python3
import click
from python_graphql_client import GraphqlClient
import yaml
from yaml.loader import SafeLoader
from os.path import expanduser

recipes_q = """
query Recipes($repoName: String!) {
    recipes(repositoryName: $repoName, first: 50) {
        edges { node { id name provider } }
    }
}
"""

recipe_q = """
query Recipe($id: ID!) {
    recipe(id: $id) {
        name
        description
        repository { description }
        recipeSections {
            repository { name }
            configuration {
                name
                type
                optional
                documentation
                longform
            }
        }
    }
}

"""

def get_token():
  with open(expanduser("~/.plural/config.yml")) as f:
    data = yaml.load(f, Loader=SafeLoader)
    return data["spec"]["token"]

def gql_client():
    token = get_token()
    return GraphqlClient(endpoint="https://app.plural.sh/gql", headers={"Authorization": f"Bearer {token}"})

def tab_content(repo, recipe):
    start = '{% tab title="' + recipe['provider'] + '" %}\n'
    mid = f"plural bundle install {repo} {recipe['name']}\n"
    end = '{% /tab %}\n'
    return f"{start}{mid}{end}"

def setup_vals(section):
    return "\n\n".join(f"`{c['name']}`: {c.get('longform') or c['documentation']}" for c in section['configuration'])

@click.command()
@click.argument("repo")
def docgen(repo):
    client = gql_client()
    recipes = client.execute(query=recipes_q, variables={'repoName': repo})
    recipes = [r['node'] for r in recipes['data']['recipes']['edges']]
    recipe = client.execute(query=recipe_q, variables={'id': recipes[0]['id']})['data']['recipe']
    tabs = "".join(tab_content(repo, r) for r in recipes)
    repo_name = repo.capitalize()
    setup = "\n\n".join(setup_vals(section) for section in recipe['recipeSections'])
    click.echo(f"""
# {repo_name}

## Description

Plural will install {repo_name} in a dependency-aware manner onto a Plural-managed Kubernetes cluster with one CLI command.

## Installation

We currently support {repo_name} for the following providers:

{'{% tabs %}'}

{tabs}
{'{% /tabs %}'}

## Setup Configuration

{setup}

""")

if __name__ == '__main__':
  docgen()
