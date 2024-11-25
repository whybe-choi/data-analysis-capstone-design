import json


def load_product_info(file_path):
    with open(file_path, "r") as f:
        products = json.load(f)

    return products


def save_text_description(output_path, products):
    with open(output_path, "w") as f:
        json.dump(products, f, ensure_ascii=False, indent=4)
