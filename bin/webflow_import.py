#!python3

import os
import time
from os.path import expanduser
import click
import yaml
from yaml.loader import SafeLoader
from webflowpy.Webflow import Webflow
from python_graphql_client import GraphqlClient

repos_q = """
query {
    repositories(first: 100) {
        edges {
            node { 
                name
                publisher { name }
                tags { tag }
                recipes { provider }
                readme
                darkIcon
                category
                icon
                mainBranch
                description
                homepage
                verified
                gitUrl
            }
        }
    }
}
"""

tags_q = """
query {
    tags(type: REPOSITORIES, first: 200) {
        edges {
          node { tag count }
        }
    }
}
"""

publishers_q = """
query {
    publishers(first: 100) {
        edges { node { name } }
    }
}
"""

categories_q = """
query {
    categories { category count }
}
"""


DATA = {
    'tags': {},
    'categories': {},
    'publishers': {}
}

CLOUD_IDS = {
    'AWS': '62dff39caac98f3e81884cd6',
    'AZURE': '62dff3b8c45364e453c2d9d1',
    'GCP': '62dff3a57aec0027c7251317',
}

BLACKLIST = {'bootstrap', 'monitoring', 'kubricks', 'gcp-config-connector', 'nvidia-operator', 'kyverno', 'test-harness'}

def get_token():
    if os.environ.get('PLURAL_ACCESS_TOKEN'):
        return os.environ['PLURAL_ACCESS_TOKEN']

    with open(expanduser("~/.plural/config.yml")) as f:
        data = yaml.load(f, Loader=SafeLoader)
        return data["spec"]["token"]

def gql_client():
    token = get_token()
    return GraphqlClient(endpoint="https://app.plural.sh/gql", headers={"Authorization": f"Bearer {token}"})

def webflow_client():
    return Webflow(token=os.environ['WEBFLOW_API_KEY'])

def diffed_update(wf, collection_id, items, key_fn, data_fn, persist=None):
    needs_update = []
    new_data = []

    collection = wf.items(collection_id, all=True)
    collection = {i['name']: i for i in collection['items']}

    for item in items:
        key = key_fn(item)
        d = data_fn(item)
        d['_archived'] = False
        d['_draft'] = False
        if key in collection:
            needs_update.append((collection[key], d))
            collection.pop(key)
        else:
            new_data.append(d)

    for d in new_data:
        click.echo(f"adding {d['name']}")
        time.sleep(1)
        res = wf.createItem(collection_id, d)
        if persist:
            persist(res)
    
    for (prev, new) in needs_update:
        click.echo(f"updating {prev['_id']}")
        time.sleep(1)
        res = wf.updateItem(collection_id, prev['_id'], new)
        if persist:
            persist(res)

    for d in collection.values():
        click.echo(f"deleting dangling {d['_id']}")
        time.sleep(1)
        wf.removeItem(collection_id, d['_id'])


def repo_data(repo):
    result = pick(repo, ['name', 'verified'])
    move(repo, result, {
        'name': 'slug',
        'gitUrl': 'github-link',
        'description': 'app-description',
        'homepage': 'website-link',
        'icon': 'app-icon',
        'mainBranch': 'main-branch',
        'readme': 'readme-2'
    })

    if repo.get('community'):
        result = {**result, **pick(repo['community'], ['slackUrl', 'twitterUrl', 'discordUrl'])}
    
    result['tags'] = [DATA['tags'][t['tag']] for t in repo['tags'] if t['tag'] in DATA['tags']]
    result['supported-clouds'] = [CLOUD_IDS[r['provider']] for r in repo['recipes'] if r['provider'] in CLOUD_IDS]
    result['publisher'] = DATA['publishers'].get(repo['publisher']['name'])
    result['icon'] = repo['darkIcon'] or repo['icon']
    result['category'] = DATA['categories'][repo['category'].lower()]
    result['hide'] = repo['name'] in BLACKLIST
    return result

def cat_data(cat):
    return {
        'name': cat['category'].lower(),
        'slug': cat['category'].lower(),
        'count': cat['count']
    }

def tag_data(tag):
    return {
        'name': tag['tag'],
        'slug': tag['tag'],
        'count': tag['count']
    }

def pub_data(pub):
    return {'name': pub['name'], 'slug': pub['name'].lower()}

def pick(d, keys):
    return {k: d[k] for k in keys}

def move(fr, to, keys):
    for k, v in keys.items():
        to[v] = fr[k]

def save_tag(tag):
    DATA['tags'][tag['name']] = tag['_id']

def save_category(cat):
    DATA['categories'][cat['name']] = cat['_id']

def save_publisher(pub):
    DATA['publishers'][pub['name']] = pub['_id'] 

@click.command()
def webflow_dump():
    wf = webflow_client()
    api = gql_client()
    
    click.echo('syncing tags')
    tags = api.execute(query=tags_q)
    diffed_update(
        wf, 
        '62dff23f10f092e109bfd32c', 
        [r['node'] for r in tags['data']['tags']['edges']], 
        lambda t: t['tag'],
        tag_data,
        save_tag,
    )

    click.echo('syncing publishers')
    tags = api.execute(query=publishers_q)
    diffed_update(
        wf, 
        '62dff34efa43e8c22263efcd', 
        [r['node'] for r in tags['data']['publishers']['edges'] if r['node']['name'] == 'Plural'], 
        lambda t: t['name'], 
        pub_data,
        save_publisher,
    )

    click.echo('syncing categories')
    tags = api.execute(query=categories_q)
    diffed_update(
        wf, 
        '62dff248cf3563b17173f811', 
        [r for r in tags['data']['categories']], 
        lambda t: t['category'].lower(),
        cat_data,
        save_category,
    )

    click.echo('syncing repositories')
    repos = api.execute(query=repos_q)
    diffed_update(
        wf, 
        '62dff22f0b55da4ddc21ef80', 
        [r['node'] for r in repos['data']['repositories']['edges'] if r['node']['name'] not in BLACKLIST], 
        lambda x: x['name'],
        repo_data
    )
    

if __name__ == '__main__':
    webflow_dump()