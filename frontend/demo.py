import streamlit as st
import requests
from PIL import Image
from io import BytesIO

title = "👕 Fashion Smart Search"
st.set_page_config(page_title=title, layout="wide")
st.title(title)

text_query = st.text_input(
    "Search term", placeholder="Describe the type of clothing you're looking for..."
)
k = st.number_input("Number of results", min_value=1, max_value=100, value=50)
text_search_button = st.button("Search")

if text_search_button and text_query:
    with st.spinner("Searching..."):
        try:
            # FastAPI 서버 엔드포인트
            url = "http://localhost:8080/search"
            payload = {"value": text_query}

            response = requests.post(url, json=payload)
            response.raise_for_status()  # HTTP 요청 에러 처리

            data = response.json()

            if data["status"] == "success":
                st.success("Search results:")

                for product in data["product_data"]:
                    metadata = product.get("metadata", {})
                    img_url = metadata.get("img_url")
                    product_name = metadata.get("product_name", "No name provided")
                    description = product.get(
                        "page_content", "No description available"
                    )
                    price = metadata.get("price", "N/A")
                    product_link = metadata.get("product_link", "#")

                    cols = st.columns([1, 2, 1])

                    if img_url:
                        try:
                            image_response = requests.get(img_url)
                            image_response.raise_for_status()
                            image = Image.open(BytesIO(image_response.content))
                            cols[0].image(image)
                        except requests.exceptions.RequestException:
                            cols[0].write("No image available")
                    else:
                        cols[0].write("No image available")

                    cols[1].markdown(f"#### [{product_name}]({product_link})")
                    cols[1].write(description)

                    if isinstance(price, (int, float)):
                        cols[2].markdown(f"**₩{price:,.0f}**")
                    else:
                        cols[2].markdown(f"**{price}**")

                    st.write("---")
            else:
                st.error("Error: " + data.get("message", "Unknown error"))

        except requests.exceptions.RequestException as e:
            st.error(f"Request failed: {e}")
