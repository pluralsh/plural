#!python3
import os
import html2text
import requests
import itertools
import openai
import json
import xml.etree.ElementTree as ET
import yaml
from yaml.loader import SafeLoader
from python_graphql_client import GraphqlClient
from llama_index import Document, VectorStoreIndex, BeautifulSoupWebReader, DiscordReader, ServiceContext, set_global_service_context
from llama_index.embeddings import OpenAIEmbedding

openai.api_key = os.environ["OPENAI_API_KEY"]

def get_token():
    if os.environ.get('PLURAL_ACCESS_TOKEN'):
        return os.environ['PLURAL_ACCESS_TOKEN']

    with open(os.path.expanduser("~/.plural/config.yml")) as f:
        data = yaml.load(f, Loader=SafeLoader)
        return data["spec"]["token"]

def gql_client():
    token = get_token()
    return GraphqlClient(endpoint="https://app.plural.sh/gql", headers={"Authorization": f"Bearer {token}"})

fetch_repos = """
query Repos($cursor: String) {
    repositories(first: 100, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        edges { node { id name } }
    }
}
"""

fetch_docs = """
query Repo($id: ID!) {
    repository(id: $id) {
        readme
        gitUrl
        docs { path content }
    }
}
"""

def document(text, **kwargs):
    return Document(text=text, metadata=kwargs)

def scrape_app_docs():
    api = gql_client()

    def list_repos(cursor):
        result = api.execute(query=fetch_repos, variables={"cursor": cursor})
        return result["data"]["repositories"]["edges"], result["data"]["repositories"]["pageInfo"]
    
    has_next, cursor = True, None
    while has_next:
        edges, page_info = list_repos(cursor)
        has_next, cursor = page_info["hasNextPage"], page_info["endCursor"]
        for node in edges:
            repo_name = node["node"]["name"]
            print(f"fetching docs for {repo_name}")
            try:
                result = api.execute(query=fetch_docs, variables={"id": node["node"]["id"]})
                repo = result["data"]["repository"]
                if repo.get("readme") and repo.get("gitUrl"):
                    yield document(repo["readme"], page_link=repo["gitUrl"], title=f"{repo_name} readme")

                for doc in repo["docs"]:
                    yield document(doc["content"], page_link=doc["path"], title=os.path.basename(doc["path"].rstrip(".md")))
            except Exception as e:
                print(f"Failed to scrape repository: {repo_name}")
                print(f"Error: {str(e)}\n")

def _docs_reader(soup):
    """Extract text from Substack blog post."""
    metadata = {
        "title": soup.title.string.strip().replace("Docs | Plural |", "") if soup.title else "No Title",
    }

    def to_markdown(soup):
        return html2text.html2text(str(soup))

    div = soup.find("div", class_="sc-520f8824-0 jyoUZy")
    if div:
        return to_markdown(div), metadata
    return to_markdown(soup), metadata

def scrape_plural_docs():
    sitemap_url = "https://docs.plural.sh/sitemap.xml"
    response = requests.get(sitemap_url)
    sitemap_content = response.text

    root = ET.fromstring(sitemap_content)
    reader = BeautifulSoupWebReader(website_extractor={"docs.plural.sh": _docs_reader})
    return reader.load_data([loc.text for loc in root.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")])

def scrape_discord():
    discord_token = os.getenv("DISCORD_TOKEN")
    channel_ids = [880837182389108766]  # Replace with your channel_id
    return DiscordReader(discord_token=discord_token).load_data(
        channel_ids=channel_ids,
        limit=5000,
        oldest_first=False
    )

embed_model = OpenAIEmbedding(embed_batch_size=10)
service_context = ServiceContext.from_defaults(embed_model=embed_model)
set_global_service_context(service_context)

chain = itertools.chain(scrape_app_docs(), scrape_plural_docs())
if os.getenv("DISCORD_TOKEN"):
    chain = itertools.chain(chain, scrape_discord())

index = VectorStoreIndex.from_documents(list(chain))
index.storage_context.persist()

print("persisted new vector index")