from fastapi import FastAPI
from explain.models import Product,products


app = FastAPI()

'''



app = FastAPI(
    title="Product API",
    description="API for managing products",
    version="1.0.0"
)

'''


#@ -> This is Python's decorator syntax


@app.get("/")  #add this app decorator
def greeting():
    return "Welcome , let's learn about APIs"




@app.get("/products")
def get_all_products():
    return products


# @app.get("/product")
# def get_product_by_id():
#     return products[0]


@app.get("/product/{id}")
def get_product_by_id(id: int):
    for product in products:
        if product.id ==  id:
            return product
    return "product not found"    



@app.post("/add/product")
def add_product(product:Product): #--> getting the type product
     products.append(product)
     return { 
             "message": "Product added successfully", 
             "product": product
             }

# put is for full update
@app.put("/product")
def update_product(id:  int , product:Product):
    for i in range(len(products)):
        if products[i].id == id:
            products[i] = product
            return {
                    "message":"product updated sucessfully", 
                    "product": product
                    }

    return "product not found"    



@app.delete("/delete/product/{id}")
def delete_product(id: int):
    for i in range(len(products)):
        if products[i].id == id:
            deleted_product = products.pop(i)
            return {
                "message": "Product is deleted",
                "product": deleted_product
                    }

    return "product not found"


    


