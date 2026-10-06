from pydantic import BaseModel


#product class
class Product(BaseModel):
    id:int # type annotation
    name: str
    description: str
    price: float
    quantity: int