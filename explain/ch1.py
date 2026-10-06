from fastapi import FastAPI


app = FastAPI()


def greeting():
    return "Welcome , let's learn about APIs"



# from fastapi import FastAPI


# app = FastAPI()


# #@ -> This is Python's decorator syntax


# @app.get("/")  #add this app decorator
# def greeting():
#     return "Welcome , let's learn about APIs"

# @app.get("/products")
# def get_products():
#     return "All products"


