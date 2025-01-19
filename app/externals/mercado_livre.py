import os
import re
import requests
from dtos.product_datails import ProductDetails


AUTH_URL = "https://auth.mercadolivre.com.br/authorization"
TOKEN_URL = "https://api.mercadolivre.com.br/oauth/token"
API_URL = "https://api.mercadolibre.com/items"

def _get_access_token(client_id, client_secret, redirect_uri, authorization_code):
    payload = {
        "grant_type": "authorization_code",
        "client_id": client_id,
        "client_secret": client_secret,
        "code": authorization_code,
        "redirect_uri": redirect_uri,
    }
    response = requests.post(TOKEN_URL, data=payload)
    response.raise_for_status()
    return response.json()["access_token"]


def _extract_item_id_from_url(url):
    pattern = r"(MLB-?\d{10})"
    match = re.search(pattern, url)

    if match:
        return match.group(1).replace("-", "")

    raise ValueError("Formato de URL inválido: não foi possível encontrar o ID do item.")

def get_product_details(product_url: str, access_token: str = None) -> ProductDetails:
    access_token = access_token or os.environ.get("MERCADO_LIVRE_ACCESS_TOKEN")

    item_id = _extract_item_id_from_url(product_url)
    headers = {"Authorization": f"Bearer {access_token}"}

    response = requests.get(f"https://api.mercadolibre.com/items/{item_id}", headers=headers)
    response.raise_for_status()
    product = response.json()
    return {
        "title": product["title"],
        "price": product["price"],
        "image": product["pictures"][0]["secure_url"] if product.get("pictures") else None,
        "description": product.get("plain_text", "No description available"),
    }
