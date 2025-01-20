import os
import requests
from dtos.product_datails import ProductDetails


def get_amazon_product_rainforest(product_url: str) -> ProductDetails:
    base_url = "https://api.rainforestapi.com/request"
    params = {
        "api_key": os.environ["RAINFOREST_API_KEY"],
        "type": "product",
        "url": product_url,
    }

    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        return {
            "title": data["product"]["title"],
            "price": data["product"]["buybox_winner"]["price"]["value"]
            if "buybox_winner" in data["product"] and "price" in data["product"]["buybox_winner"]
            else 0,
            "image": data["product"]["main_image"]["link"],
            "description": data["product"].get("description", ""),
        }
    else:
        return None
