from pydantic import BaseModel


#product class
class Product(BaseModel):
    id:int # type annotation
    name: str
    description: str
    price: float
    quantity: int


    # def __init__(self, id: int, name: str, description: str, price: float, quantity: int):
    #     self.id = id
    #     self.name = name
    #     self.description=description
    #     self.price = price
    #     self.quantity=quantity


#product list of class calls

products = [
    Product(id=1, name="Notebook", description="A lined notebook", price=4.99, quantity=20),
    Product(id=2, name="Pen", description="Blue ink ballpoint pen", price=1.50, quantity=100),
    Product(id=3, name="Backpack", description="Water-resistant school backpack", price=29.99, quantity=15),
    Product(id=4, name="Water Bottle", description="Reusable stainless steel bottle", price=12.75, quantity=30),
    Product(id=5, name="Desk Lamp", description="LED lamp with adjustable brightness", price=22.00, quantity=8),
    Product(id=6, name="Headphones", description="Wireless over-ear headphones", price=59.95, quantity=12),
    Product(id=7, name="Keyboard", description="Compact mechanical keyboard", price=45.00, quantity=10),
    Product(id=8, name="Mouse", description="Wireless optical mouse", price=18.25, quantity=25),
    Product(id=9, name="Coffee Mug", description="Ceramic mug with a handle", price=8.50, quantity=40),
    Product(id=10, name="Sticky Notes", description="Pack of yellow sticky notes", price=3.25, quantity=50),
]
