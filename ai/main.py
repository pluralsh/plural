from fastapi import FastAPI, HTTPException
from llama_index import StorageContext, load_index_from_storage
from llama_index.indices.postprocessor import SentenceEmbeddingOptimizer

from pydantic import BaseModel

app = FastAPI()

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str

storage_context = StorageContext.from_defaults(persist_dir="./storage")
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
