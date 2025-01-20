import requests
import time
import hmac
import hashlib


# Função para assinar a requisição usando o Partner Key
def sign_request(partner_key, params):
    sorted_params = sorted(params.items())
    query_string = '&'.join([f'{key}={value}' for key, value in sorted_params])
    query_string += f'&partner_key={partner_key}'

    # Gerar assinatura usando HMAC-SHA256
    signature = hmac.new(partner_key.encode('utf-8'), query_string.encode('utf-8'), hashlib.sha256).hexdigest().upper()
    return signature


# Função para obter detalhes do produto
def get_shopee_product_details(partner_id, partner_key, item_id):
    url = 'https://partner.shopeemobile.com/api/v1/item/get'

    # Parâmetros da requisição
    params = {
        'partner_id': partner_id,
        'item_id': item_id,
        'timestamp': int(time.time())
    }

    # Assinar a requisição
    signature = sign_request(partner_key, params)
    params['sign'] = signature

    # Enviar a requisição
    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        if 'item' in data:
            item = data['item']
            return {
                "title": item.get("name", "Título não encontrado"),
                "price": item.get("price", "Preço não encontrado"),
                "image": item.get("image", "Imagem não encontrada"),
                "description": item.get("description", "Descrição não encontrada")
            }
        else:
            return {"error": "Produto não encontrado"}
    else:
        return {"error": f"Erro na requisição: {response.status_code}"}


# Exemplo de uso
partner_id = 'SEU_PARTNER_ID_AQUI'
partner_key = 'SEU_PARTNER_KEY_AQUI'
item_id = 'ID_DO_PRODUTO_AQUI'

product_details = get_shopee_product_details(partner_id, partner_key, item_id)
print(product_details)
