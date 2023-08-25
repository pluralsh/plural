import os
import openai
import asyncio
from fastapi import FastAPI, HTTPException
from llama_index import StorageContext, load_index_from_storage, ServiceContext, set_global_service_context
from llama_index.indices.postprocessor import SentenceEmbeddingOptimizer
from llama_index.embeddings import OpenAIEmbedding
from s3fs import S3FileSystem
from pydantic import BaseModel

def load_query_engine(vector_store_index_path: str):
    storage_context = StorageContext.from_defaults(
        # persist_dir format: "<bucket-name>/<path>"
        persist_dir=vector_store_index_path,
        fs=S3FileSystem()
    )
    index = load_index_from_storage(storage_context)
    return index.as_query_engine(
        node_postprocessors=[SentenceEmbeddingOptimizer(percentile_cutoff=0.5)],    
        response_mode="compact",
        similarity_cutoff=0.7
    )

openai.api_key = os.environ["OPENAI_API_KEY"]
vector_store_index_path = os.getenv("PLURAL_AI_INDEX_S3_PATH", "plural-assets/dagster/plural-ai/vector_store_index")

app = FastAPI()
embed_model = OpenAIEmbedding(embed_batch_size=10)
service_context = ServiceContext.from_defaults(embed_model=embed_model)
set_global_service_context(service_context)
query_engine = load_query_engine(vector_store_index_path)

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str

async def reload_query_engine():
    global query_engine
    while True:
        await asyncio.sleep(86400) # daily
        query_engine = load_query_engine(vector_store_index_path)

@app.on_event("startup")
async def schedule_periodic():
    loop = asyncio.get_event_loop()
    loop.create_task(reload_query_engine())

@app.get("/")
def read_root():
    return {"Plural": "AI"}

@app.post("/chat")
def query_data(request: QueryRequest):
    response = query_engine.query(request.question)
    if not response:
        raise HTTPException(status_code=404, detail="No results found")

    return QueryResponse(answer=str(response))
