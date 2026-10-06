# Understanding the Database and FastAPI Syntax

This guide explains the code in `main.py` in a step-by-step style. The goal is to understand what each piece means, not just memorize the syntax.

## 1. Creating the database table

```python
db_models.Base.metadata.create_all(bind=engine)
```

This tells SQLAlchemy:

> Look at the database models I have defined, and create their tables in the database if they do not exist yet.

Think of the pieces like this:

```text
db_models
└── Base
    └── metadata
        └── create_all(...)
```

- `db_models` is the Python file/module where the SQLAlchemy `Product` table model is defined.
- `Base` is the parent class used by SQLAlchemy models. SQLAlchemy keeps track of models that inherit from it.
- `metadata` is the collection of table designs registered with `Base`.
- `create_all(...)` creates the missing database tables described by those designs.
- `bind=engine` tells SQLAlchemy which database to connect to. In this project, `engine` comes from `database.py`.

It creates missing tables, but it does not automatically change an existing table when you edit the model. Projects commonly use migrations to manage those changes.

## 2. What is a database session?

The project has this in `database.py`:

```python
session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

`sessionmaker(...)` creates a **session factory**. A factory is something that can create objects for you. Calling it creates a database session:

```python
db = session()
```

A session is the object your Python code uses to query, add, update, or delete database rows. You can think of it as a work session with the database.

## 3. What does `get_db()` do?

```python
def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()
```

This function creates a session, gives it to the code that needs it, and closes it afterward.

Step by step:

1. `db = session()` creates a new database session.
2. `yield db` hands the session to FastAPI for the current request.
3. The route uses that session to work with the database.
4. When request handling is finished, Python continues into the `finally` block.
5. `db.close()` releases the session's database resources.

`yield` is like `return` in that it provides a value, but it pauses the function instead of ending it permanently. FastAPI can resume the function later so the cleanup code runs. The `finally` block runs even if an error happens while the route is running.

Closing a session is cleanup; it does not mean “save all changes.” Code that changes data calls `db.commit()` to save those changes.

## 4. What does `init_db()` do?

```python
def init_db():
    db = session()
    count = db.query(db_models.Product).count()

    if count == 0:
        for product in products:
            db.add(db_models.Product(**product.model_dump()))

    db.commit()

init_db()
```

This checks whether the products table already has rows. If it is empty, it adds the sample products and saves them.

### Check whether the table has products

```python
count = db.query(db_models.Product).count()
```

Read it as:

> Ask the database for the number of rows in the `Product` table, and store that number in `count`.

- `db.query(db_models.Product)` starts a query for `Product` rows.
- `.count()` asks for the number of matching rows.

Then:

```python
if count == 0:
```

means:

> Only run the indented code if the table currently contains zero products.

### Loop through the sample products

```python
for product in products:
```

`products` is a list of Pydantic `Product` objects from `explain/models.py`. The loop takes one item from that list at a time and calls that item `product`.

### Turn a Pydantic object into a database object

```python
db.add(db_models.Product(**product.model_dump()))
```

This line has a few steps packed together. Imagine `product` is this Pydantic object:

```python
Product(
    id=1,
    name="Notebook",
    description="A lined notebook",
    price=4.99,
    quantity=20
)
```

First, `.model_dump()` turns it into a regular Python dictionary:

```python
{
    "id": 1,
    "name": "Notebook",
    "description": "A lined notebook",
    "price": 4.99,
    "quantity": 20
}
```

Then `**` unpacks the dictionary into named arguments. This:

```python
db_models.Product(**product.model_dump())
```

is essentially the same as writing:

```python
db_models.Product(
    id=1,
    name="Notebook",
    description="A lined notebook",
    price=4.99,
    quantity=20
)
```

`db_models.Product(...)` creates a SQLAlchemy object that represents a row in the database. Notice that the project has two different `Product` classes:

```text
explain.models.Product  → Pydantic model; validates/describes product data
db_models.Product      → SQLAlchemy model; describes a database table row
```

Next, `db.add(...)` tells the session to add this object as a new row. The change is pending in the session until it is committed:

```python
db.commit()
```

`commit()` saves the pending database changes.

Finally:

```python
init_db()
```

actually calls the function. Without this line, Python would only define `init_db`; it would not run its body. In this project, the call runs when `main.py` is imported by the server.

## 5. What does dependency injection mean here?

Here is the route:

```python
@app.get("/products")
def get_all_products(db: Session = Depends(get_db)):
    db_products = db.query(db_models.Product).all()
    return db_products
```

The route needs a database session. It could create one itself, but then it would also need to remember to close it. Instead, it tells FastAPI what it needs:

```python
db: Session = Depends(get_db)
```

Break that down:

- `db` is the name of the function argument that will hold the session.
- `Session` is a type annotation saying what kind of value `db` should contain.
- `Depends(get_db)` tells FastAPI to call `get_db` to provide that value.

**Dependency injection** means the route declares the thing it needs, and FastAPI supplies it. In this case:

```text
GET /products arrives
        ↓
FastAPI calls get_db()
        ↓
get_db yields a database session
        ↓
FastAPI passes that session into the route as db
        ↓
the route uses db to query products
        ↓
FastAPI finishes the dependency and get_db closes the session
```

Now read the query:

```python
db_products = db.query(db_models.Product).all()
```

It means:

> Query all rows from the `Product` table and store the results in `db_products`.

`return db_products` sends those results back as the route response. FastAPI converts the returned data into JSON for the client.

The decorator above the function:

```python
@app.get("/products")
```

tells FastAPI to run `get_all_products` when a client sends an HTTP `GET` request to `/products`.

## 6. What is CORS middleware?

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Suppose your React app runs at:

```text
http://localhost:5173
```

and your FastAPI server runs at:

```text
http://localhost:8000
```

The browser treats these as different **origins** because their ports differ. Browsers apply a security rule to requests from one origin to another. CORS is the mechanism that lets the API tell the browser which cross-origin requests it will allow.

`app.add_middleware(...)` adds shared request/response handling to the FastAPI app. `CORSMiddleware` handles the CORS rules and adds the relevant response headers.

The settings mean:

```python
allow_origins=["*"]  # accept requests from any origin
allow_methods=["*"]  # accept any HTTP method, such as GET or POST
allow_headers=["*"]  # accept any request headers
```

The `*` character here means “any.” This is convenient while learning and developing locally. For a deployed app, it is better to list the specific frontend origin(s) that should access the API. CORS is a browser rule; it does not log users in or replace authentication.

## The whole idea in a short version

```text
create_all(...)  → make missing tables from SQLAlchemy models
session()        → create a database session
get_db()         → provide a session to a request, then close it
Depends(get_db)  → ask FastAPI to provide that session to a route
db.add(...)      → stage a new row in the session
db.commit()      → save pending changes
CORSMiddleware  → tell browsers which cross-origin requests are allowed
```
