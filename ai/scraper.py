import requests
from bs4 import BeautifulSoup
import json
import xml.etree.ElementTree as ET

# Fetch the sitemap XML content
sitemap_url = "https://docs.plural.sh/sitemap.xml"
response = requests.get(sitemap_url)
sitemap_content = response.text

# Parse the XML content
root = ET.fromstring(sitemap_content)

# Find all <loc> elements and extract the link URLs
urls = []
for loc_elem in root.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc"):
    link = loc_elem.text
    urls.append(link)


docs_text = []

# Iterate over each page URL
for i, url in enumerate(urls):
    try:
        # Fetch the HTML content
        response = requests.get(url)
        html_content = response.content

        # Parse the HTML using BeautifulSoup
        soup = BeautifulSoup(html_content, "html.parser")

        # Extract the page title
        title = soup.title.string.strip().replace("Docs | Plural |", "") if soup.title else "No Title"

        # Find the target div element
        div = soup.find("div", class_="sc-520f8824-0 jyoUZy")

        if div:
            # Extract the desired content
            subtitle = div.find("p").text.strip()
            content_elements = div.find_all(["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "pre", "img", "a"])

            # Convert content elements to markdown format
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

            # Convert markdown content to a single string
            markdown_text = "\n\n".join(markdown_content)

            # Create a dictionary for the scraped data
            doc_data = {
                "id": i + 1,
                "page_link": url,
                "title": title,
                "text": markdown_text,
                "source_links": [],
            }

            # Append the dictionary to the list
            docs_text.append(doc_data)

    except Exception as e:
        print(f"Failed to scrape page: {url}")
        print(f"Error: {str(e)}")
        print()

# Write the scraped data to a JSON file
with open("scraped_data.json", "w") as file:
    json.dump(docs_text, file, indent=4)

print("Scraped data saved to 'scraped_data.json'")