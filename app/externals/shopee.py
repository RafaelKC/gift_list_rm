import re
import requests


def extract_ids_from_url(url):
    pattern = r"i\.(\d+)\.(\d+)"
    match = re.search(pattern, url)
    if match:
        shop_id, item_id = match.groups()
        return shop_id, item_id
    else:
        raise ValueError("Invalid Shopee URL format")


def get_shopee_product_details(url):
    try:
        shop_id, item_id = extract_ids_from_url(url)

        api_url = f"https://shopee.com/api/v4/item/get"
        params = {"itemid": item_id, "shopid": shop_id}

        response = requests.get(api_url, params=params)
        response.raise_for_status()

        data = response.json()
        if "data" in data:
            product = data["data"]
            return {
                "name": product["name"],
                "price": product["price"] / 100000,
                "image": f'https://cf.shopee.com.my/file/{product["image"]}',
                "description": product["description"]
            }
        else:
            raise Exception("No product data found in the response")
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    product_url = input("Enter Shopee product URL: ")
    details = get_shopee_product_details(product_url)
    print(details)
