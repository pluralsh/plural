# pluralai
This using the python llama index project to manage most of the embedding and storage, which has plugins for most of the stuff we need.  There is both a scraper and a webserver.  Run instructions are available for both.

To do either, you'll need to install `requirements.txt` with:

```sh
pip install -r requirments.txt
```

## Running the webserver
The server is built with FastAPI. To start the server by running `uvicorn main:app --reload`

Swaggger Documentation: /docs
Chat endpoint: /chat

## Running scraper.py

The scraper currently incorporates three datasources:

* the sitemap from docs.plural.sh
* the app specific docs from the plural gql api
* discord message history

You'll need an openai api key to generate embeddings, and to scrape discord (optional) you'll also need a discord token.  Export both with:

```sh
export OPENAI_API_KEY=an-openai-key
export DISCORD_TOKEN=a-discord-token
```

You should then be able to run:

```sh
./scraper.py
```
