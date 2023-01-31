#!python3
import asyncio
import os
import time
import json
from os.path import expanduser
from pathlib import Path
import click
import yaml
from yaml.loader import SafeLoader
from webflowpy.Webflow import Webflow
from python_graphql_client import GraphqlClient
from docker_registry_client_async import DockerRegistryClientAsync, ImageName, Manifest, FormattedSHA256

repos_q = """
query {
    repositories(first: 100) { edges { node { id name } } }
}
"""

dkr_repos_q = """
query Dkr($id: ID!) {
    dockerRepositories(repositoryId: $id, first: 500) {
        edges { node { id name } }
    }
}
"""

dkr_imgs_q = """
query DkrImg($id: ID!) {
    dockerImages(dockerRepositoryId: $id, first: 1000) {
        edges { node { id tag } }
    }
}
"""

def get_token():
    if os.environ.get('PLURAL_ACCESS_TOKEN'):
        return os.environ['PLURAL_ACCESS_TOKEN']

    with open(expanduser("~/.plural/config.yml")) as f:
        data = yaml.load(f, Loader=SafeLoader)
        return data["spec"]["token"]

def gql_client():
    token = get_token()
    return GraphqlClient(endpoint="https://app.plural.sh/gql", headers={"Authorization": f"Bearer {token}"})


async def delete_missing(dkr_client, manifest, imgname):
    for layer in manifest['layers']:
        has_blob = await dkr_client.head_blob(imgname, FormattedSHA256.parse(layer['digest']))
        # print(has_blob.client_response)
        if not has_blob.result:
            click.echo(f"deleting: {json.dumps(manifest)}")
            await dkr_client.delete_manifest(imgname)
            return

async def find_images_for_repo(dkr_client, repo):
    api = gql_client()
    dkr_repos = api.execute(query=dkr_repos_q, variables={"id": repo["id"]})
    for dkr in dkr_repos['data']['dockerRepositories']['edges']:
        dkr = dkr['node']
        dkr_imgs = api.execute(query=dkr_imgs_q, variables={"id": dkr['id']})
        for img in dkr_imgs['data']['dockerImages']['edges']:
            img = img['node']
            img_url = f"dkr.plural.sh/{repo['name']}/{dkr['name']}:{img['tag']}"
            click.echo(f"testing {img_url}")
            image_name = ImageName.parse(img_url)
            try:
                manifest = await dkr_client.get_manifest(image_name)
                manifest = manifest.manifest.get_json()
                if manifest.get('layers'):
                    imgname = ImageName.parse(f"dkr.plural.sh/{repo['name']}/{dkr['name']}:{manifest['config']['digest']}")
                    await delete_missing(dkr_client, manifest, imgname)
                    continue
        
                for man in manifest['manifests']:
                    imgname = ImageName.parse(f"dkr.plural.sh/{repo['name']}/{dkr['name']}:{man['digest']}")
                    subman = await dkr_client.get_manifest(imgname)
                    await delete_missing(dkr_client, subman.manifest.get_json(), imgname)
            except Exception as e:
                click.echo(f"failure executing {img_url}")
                print(e)

async def _list_imgs():
    async with DockerRegistryClientAsync(credentials_store=Path("./config.json")) as dkr_client:
        api = gql_client()
        repos = api.execute(query=repos_q)['data']['repositories']['edges']
        for i in range(0, len(repos), 5):
            await asyncio.wait([find_images_for_repo(dkr_client, repo['node']) for repo in repos[i:i+5]])


@click.command()
def list_imgs():
    asyncio.run(_list_imgs())

if __name__ == '__main__':
    list_imgs()
  