import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ..core.vectordb import load_dense_retriever, load_embed_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Smart Search API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent  # backend
EMBED_MODEL = load_embed_model("upskyy/bge-m3-korean")


@app.options("/search")
async def options_handler():
    """
    Handle CORS preflight requests.
    """
    return {
        "message": "CORS preflight request",
    }


@app.post("/search")
async def search(request: Request):
    """
    Handle POST search requests.
    """
    try:
        # 요청 데이터 가져오기
        body = await request.json()
        query = body.get("value")  # Flask 코드와 동일하게 'value' 키 사용
        if not query:
            raise HTTPException(
                status_code=400, detail="Missing 'value' in request body"
            )

        logger.info(f"Query: {query}")

        # Retriever 초기화 및 문서 검색
        retriever = load_dense_retriever(
            persist_path=BASE_DIR / "vectordb",
            collection_name="top",
            embed_model=EMBED_MODEL,
            k=50,
        )
        products = retriever.invoke(query)

        # Document 객체를 JSON 변환 가능 형태로 변환
        product_data = [
            {
                "metadata": doc.metadata,
                "page_content": doc.page_content,
            }
            for doc in products
        ]

        return {
            "status": "success",
            "received_value": query,
            "product_data": product_data[:10],
        }

    except Exception as e:
        logger.error(f"Error during search: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
