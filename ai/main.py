import os
import openai
from fastapi import FastAPI, HTTPException
from llama_index import StorageContext, load_index_from_storage, ServiceContext, set_global_service_context
from llama_index.indices.postprocessor import SentenceEmbeddingOptimizer
from llama_index.embeddings import OpenAIEmbedding
from s3fs import S3FileSystem

from pydantic import BaseModel

openai.api_key = os.environ["OPENAI_API_KEY"]

app = FastAPI()

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str


embed_model = OpenAIEmbedding(embed_batch_size=10)
service_context = ServiceContext.from_defaults(embed_model=embed_model)
set_global_service_context(service_context)

storage_context = StorageContext.from_defaults(
    # persist_dir format: "<bucket-name>/<path>"
    persist_dir=os.getenv("PLURAL_AI_INDEX_S3_PATH", "plural-assets/dagster/plural-ai/vector_store_index"),
    fs=S3FileSystem()
)
index = load_index_from_storage(storage_context)
query_engine = index.as_query_engine(
    node_postprocessors=[SentenceEmbeddingOptimizer(percentile_cutoff=0.5)],    
    response_mode="compact",
    similarity_cutoff=0.7
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/chat")
def query_data(request: QueryRequest):
    response = query_engine.query(request.question)
    if not response:
        raise HTTPException(status_code=404, detail="No results found")

    return QueryResponse(answer=str(response))
