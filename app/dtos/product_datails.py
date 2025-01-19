from typing import TypedDict, Optional


class ProductDetails(TypedDict):
    title: str
    price: float
    description: Optional[str]
    image: Optional[str]