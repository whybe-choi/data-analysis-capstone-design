import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ..core.vectordb import load_dense_retriever, load_embed_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Smart Search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str
    k: int = 50


BASE_DIR = Path(__file__).resolve().parent.parent  # backend
EMBED_MODEL = load_embed_model("upskyy/bge-m3-korean")


# 검색 엔드포인트
@app.post("/search")
async def search(request: QueryRequest):
    try:
        print("query: ", request.query)
        retriever = load_dense_retriever(
            persist_path=BASE_DIR / "vectordb",
            collection_name="top",
            embed_model=EMBED_MODEL,
            k=request.k,
        )
        products = retriever.invoke(request.query)
        outputs = [
            {
                "metadata": product.metadata,
                "page_content": product.page_content,
            }
            for product in products
        ]
        return {"status": "success", "query": request.query, "products": outputs[:10]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
