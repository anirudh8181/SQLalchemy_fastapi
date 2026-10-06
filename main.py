from fastapi import FastAPI , Depends
from fastapi.middleware.cors import CORSMiddleware
from explain.models import Product,products
from database import session, engine
import db_models
from sqlalchemy.orm import Session



app = FastAPI()

# allow the React frontend (running on a different port) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

db_models.Base.metadata.create_all(bind=engine)

def get_db():
    db=session()
    try:
        yield db
    finally:
         db.close()    


def init_db():

    db=session()

    count= db.query(db_models.Product).count()

    if count == 0:
      for product in products: 
         db.add(db_models.Product(**product.model_dump()))

    db.commit()   

init_db()    


@app.get("/")  
def greeting():
    return "Welcome , let's learn about APIs"




@app.get("/products")
def get_all_products(db: Session = Depends(get_db)):
    db_products = db.query(db_models.Product).all()
    return db_products


@app.get("/product/{id}")
def get_product_by_id(id: int,db: Session = Depends(get_db)):
    db_product =  db.query(db_models.Product).filter(db_models.Product.id==id).first()
    if db_product:
        return db_product
    return "product not found"    



@app.post("/add/product")
def add_product(product:Product, db: Session = Depends(get_db)): 
     db.add(db_models.Product(**product.model_dump()))
     db.commit()
     return { 
             "message": "Product added successfully", 
             "product": product
             }



@app.put("/product")
def update_product(id:  int , product:Product, db: Session = Depends(get_db)):
    db_product =  db.query(db_models.Product).filter(db_models.Product.id==id).first()
    if db_product:
        db_product.name = product.name
        db_product.description = product.description
        db_product.price = product.price
        db_product.quantity = product.quantity
        db.commit()
        db.refresh(db_product)
        return {
                "message":"product updated sucessfully",
                "product": db_product
                }

    return "product not found"


 

@app.delete("/delete/product/{id}")
def delete_product(id: int, db: Session = Depends(get_db)):
    db_product = db.query(db_models.Product).filter(db_models.Product.id==id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
        return {
            "message": "Product is deleted",
            "product": db_product
                }

    return "product not found"


    


