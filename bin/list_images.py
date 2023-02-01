#!python3
import asyncio
import aiohttp
import signal
import os
import sys
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
    dockerImages(dockerRepositoryId: $id, first: 5000) {
        edges { node { id tag } }
    }
}
"""

SEEN = set()

def read_seen():
    seen_file = Path('./.seen')
    with seen_file.open() as f:
        for l in f.readlines():
            SEEN.add(l.strip())

def flush_seen(*_args):
    seen_file = Path('./.seen')
    with seen_file.open('w') as f:
        f.writelines([f"{r}\n" for r in SEEN])
    sys.exit(0)

def get_token():
    if os.environ.get('PLURAL_ACCESS_TOKEN'):
        return os.environ['PLURAL_ACCESS_TOKEN']

    with open(expanduser("~/.plural/config.yml")) as f:
        data = yaml.load(f, Loader=SafeLoader)
        return data["spec"]["token"]

def gql_client():
    token = get_token()
    return GraphqlClient(endpoint="https://app.plural.sh/gql", headers={"Authorization": f"Bearer {token}"})


def copy_from_gcr(url):
    parts = url.split("/")
    gcr_url = "/".join(parts[2:])
    os.system(f"skopeo copy --multi-arch all --dest-authfile config.json docker://gcr.io/pluralsh/{gcr_url} docker://{url}")

async def delete_missing(dkr_client, manifest, imgname, original, f):
    for layer in manifest['layers']:
        has_blob = await dkr_client.head_blob(imgname, FormattedSHA256.parse(layer['digest']))
        # print(has_blob.client_response)
        if not has_blob.result:
            click.echo(f"deleting {original}")
            await dkr_client.delete_manifest(imgname)
            f.writelines(f"{original}\n")
            copy_from_gcr(original)
            return

async def ensure_tokens_present(dkr_client, path):
    key = None
    for pattern in dkr_client.tokens:
        if pattern.fullmatch("dkr.plural.sh"):
            key = pattern
            break
    if key is None:
        key = await DockerRegistryClientAsync._get_endpoint_pattern(
            endpoint="dkr.plural.sh"
        )
    scope = f"repository:{path}:pull"
    if scope in dkr_client.tokens.get(key, {}):
        return
    async with aiohttp.ClientSession() as session:
        plrl_token = get_token()
        async with session.post(f"https://app.plural.sh/auth/token?scope={scope}&password={plrl_token}") as response:
            resp = await response.text()
            resp = json.loads(resp)
            if not dkr_client.tokens.get(key):
                dkr_client.tokens[key] = {}
            dkr_client.tokens[key][scope] = resp['token']
            dkr_client.tokens[key][f"repository:{path}:push"] = resp['token']

async def maybe_prune_img(dkr_client, img, repo, dkr, f):
    img = img['node']
    img_url = f"dkr.plural.sh/{repo['name']}/{dkr['name']}:{img['tag']}"
    if img_url in SEEN:
        return

    click.echo(f"testing {img_url}")
    image_name = ImageName.parse(img_url)
    try:
        manifest = await dkr_client.get_manifest(image_name)
        manifest = manifest.manifest.get_json()
        if manifest.get('layers'):
            imgname = ImageName.parse(f"dkr.plural.sh/{repo['name']}/{dkr['name']}:{manifest['config']['digest']}")
            await delete_missing(dkr_client, manifest, imgname, img_url, f)
            SEEN.add(img_url)
            return

        for man in manifest['manifests']:
            imgname = ImageName.parse(f"dkr.plural.sh/{repo['name']}/{dkr['name']}:{man['digest']}")
            subman = await dkr_client.get_manifest(imgname)
            await delete_missing(dkr_client, subman.manifest.get_json(), imgname, img_url, f)
        SEEN.add(img_url)
    except Exception as e:
        click.echo(f"failure executing {img_url}, attempting a copy")
        copy_from_gcr(img_url)
        print(e)

SUBSTEP = 5

async def find_images_for_repo(dkr_client, repo, f):
    api = gql_client()
    dkr_repos = api.execute(query=dkr_repos_q, variables={"id": repo["id"]})
    for dkr in dkr_repos['data']['dockerRepositories']['edges']:
        dkr = dkr['node']
        dkr_imgs = api.execute(query=dkr_imgs_q, variables={"id": dkr['id']})['data']['dockerImages']['edges']
        await ensure_tokens_present(dkr_client, f"{repo['name']}/{dkr['name']}")

        for i in range(0, len(dkr_imgs), SUBSTEP):
            await asyncio.wait([maybe_prune_img(dkr_client, img, repo, dkr, f) for img in dkr_imgs[i:i+SUBSTEP]])

STEP = 8

async def _list_imgs():
    with Path('./.deleted-imgs').open('a') as f:
        async with DockerRegistryClientAsync(credentials_store=Path("./config.json")) as dkr_client:
            api = gql_client()
            repos = api.execute(query=repos_q)['data']['repositories']['edges']
            for i in range(0, len(repos), STEP):
                await asyncio.wait([find_images_for_repo(dkr_client, repo['node'], f) for repo in repos[i:i+STEP]])


@click.command()
def list_imgs():
    asyncio.run(_list_imgs())

if __name__ == '__main__':
    signal.signal(signal.SIGINT, flush_seen)
    signal.signal(signal.SIGTERM, flush_seen)
    read_seen()
    list_imgs()
    flush_seen()
