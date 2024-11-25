import json
from pathlib import Path

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter

from qdrant_client import QdrantClient, models


def load_embed_model(model_path):
    """
    Load the embed model from local path
    """
    model = HuggingFaceEmbeddings(
        model_name=model_path,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )
    return model


def load_docs(file_path, chunking=True):
    """
    Load the documents from the file
    """
    with open(file_path, "r") as f:
        products = json.load(f)

    documents = []
    for product in products:
        document = Document(
            page_content=product["text_description"],
            metadata={
                "product_link": product["product_link"],
                "brand_id": product["brand_id"],
                "product_name": product["product_name"],
                "price": product["price"],
                "img_url": product["img_url"],
            },
        )
        documents.append(document)

    if chunking:
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=200,
            chunk_overlap=50,
            length_function=len,
        )
        documents = text_splitter.split_documents(documents)

    return documents


def index_to_vectordb(persist_path, collection_name, embed_model, documents):
    """
    Index the documents to the vector database
    """
    client = QdrantClient(path=persist_path)
    client.create_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(
            size=1024,
            distance=models.Distance.COSINE,
        ),
    )
    vector_store = QdrantVectorStore(
        client=client, collection_name=collection_name, embedding=embed_model
    )
    vector_store.add_documents(documents)


def load_dense_retriever(persist_path, collection_name, embed_model, k):
    """
    Load the dense retriever model
    """
    client = QdrantClient(path=persist_path)
    vector_store = QdrantVectorStore(
        client=client, collection_name=collection_name, embedding=embed_model
    )

    dense_retriever = vector_store.as_retriever(search_kwargs={"k": k})

    return dense_retriever


if __name__ == "__main__":
    model_id = "upskyy/bge-m3-korean"
    embed_model = load_embed_model(model_id)

    BASE_DIR = Path(__file__).parent.parent
    PERSIST_DIR = BASE_DIR / "vectordb"
    DATA_DIR = BASE_DIR / "data"

    data_files = list(DATA_DIR.glob("*.json"))
    for file_path in data_files:
        print(f"Indexing {file_path}")
        documents = load_docs(file_path, chunking=False)
        collection_name = Path(file_path).stem
        index_to_vectordb(
            persist_path=PERSIST_DIR,
            collection_name=collection_name,
            embed_model=embed_model,
            documents=documents,
        )
