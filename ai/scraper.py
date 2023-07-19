import os
import requests
import itertools
from bs4 import BeautifulSoup
import json
import xml.etree.ElementTree as ET
import yaml
from yaml.loader import SafeLoader
from python_graphql_client import GraphqlClient


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
        docs { path content }
    }
}
"""

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
                for doc in result["data"]["repository"]["docs"]:
                    yield {
                        "page_link": doc["path"],
                        "title": os.path.basename(doc["path"]).rstrip(".md"),
                        "text": doc["content"],
                        "source_links": [],
                    }
            except Exception as e:
                print(f"Failed to scrape repository: {repo_name}")
                print(f"Error: {str(e)}\n")

def scrape_plural_docs():
    sitemap_url = "https://docs.plural.sh/sitemap.xml"
    response = requests.get(sitemap_url)
    sitemap_content = response.text

    root = ET.fromstring(sitemap_content)
    for loc_elem in root.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc"):
        url = loc_elem.text
        try:
            print(f"visiting {url}")
            response = requests.get(url)
            soup = BeautifulSoup(response.content, "html.parser")

            title = soup.title.string.strip().replace("Docs | Plural |", "") if soup.title else "No Title"
            div = soup.find("div", class_="sc-520f8824-0 jyoUZy")
            if div:
                subtitle = div.find("p").text.strip()
                content_elements = div.find_all(["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "pre", "img", "a"])
                markdown_content = []
                for element in content_elements:
                    if element.name.startswith("h"):
                        heading_level = int(element.name[1])
                        heading_text = element.text.strip()
                        markdown_content.append("#" * heading_level + " " + heading_text)
                    elif element.name == "pre":
                        code_block = element.text.strip()
                        markdown_content.append(f"```\n{code_block}\n```")
                    elif element.name == "img":
                        image_src = element["src"]
                        markdown_content.append(f"![Image]({image_src})")
                    elif element.name == "a":
                        link_href = element["href"]
                        link_text = element.text.strip()
                        markdown_content.append(f"[{link_text}]({link_href})")
                    else:
                        paragraph_text = element.text.strip()
                        markdown_content.append(paragraph_text)

                markdown_text = "\n\n".join(markdown_content)

                yield {
                    "page_link": url,
                    "title": title,
                    "text": markdown_text,
                    "source_links": [],
                }

        except Exception as e:
            print(f"Failed to scrape page: {url}")
            print(f"Error: {str(e)}\n")

def indexed(doc, i):
    doc["id"] = i
    return doc

with open("scraped_data.json", "w") as file:
    docs = [indexed(d, i) for i, d in enumerate(itertools.chain(scrape_app_docs(), scrape_plural_docs()))]
    json.dump(docs, file, indent=2)

print("Scraped data saved to 'scraped_data.json'")