# FastAPI — Introduction Notes

## 1. What is FastAPI?

**FastAPI is a modern Python web framework used to build APIs and web services.**

It is mainly used to create **REST APIs** that allow different applications to communicate with each other.

For example:

```text
Frontend
   ↓
FastAPI API
   ↓
Database
```

A frontend application can send a request to FastAPI, FastAPI processes the request, interacts with a database or another service, and returns a response.

---

## 2. What is an API?

**API = Application Programming Interface**

An API provides a way for one application to communicate with another application.

For example, suppose you have a frontend:

```text
React Application
```

and a backend:

```text
FastAPI Application
```

The frontend might request:

```http
GET /users
```

FastAPI processes it and returns:

```json
{
    "users": [
        "Anirudh",
        "Rahul"
    ]
}
```

So:

```text
Frontend
   │
   │ HTTP Request
   ↓
FastAPI
   │
   │ HTTP Response
   ↓
Frontend
```

---

# 3. Why is FastAPI called a Framework?

A **framework** provides tools and structure for building applications.

Without a framework, you would have to implement many things yourself.

FastAPI provides features such as:

- URL routing
- Request handling
- Response handling
- Request validation
- JSON serialization
- Dependency injection
- Authentication/authorization support
- Automatic API documentation
- Async support
- Error handling

So instead of manually building all of these, you use FastAPI's features.

---

# 4. FastAPI is a Python Framework

FastAPI uses Python.

Example:

```python
from fastapi import FastAPI

app = FastAPI()
```

Here:

```text
FastAPI()
    ↓
Creates a FastAPI application
```

`app` is the FastAPI application object.

---

# 5. Your First FastAPI Application

A basic FastAPI application looks like this:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Hello World"}
```

Let's break this down.

### Import FastAPI

```python
from fastapi import FastAPI
```

You import the `FastAPI` class.

---

### Create the application

```python
app = FastAPI()
```

This creates your FastAPI application.

You can think of:

```text
app
 ↓
Your API application
```

---

### Create a route

```python
@app.get("/")
```

This defines an HTTP GET endpoint.

It means:

```text
GET /
```

---

### Define the function

```python
def home():
    return {"message": "Hello World"}
```

When somebody requests:

```text
GET /
```

FastAPI executes:

```python
home()
```

and returns:

```json
{
    "message": "Hello World"
}
```

---

# 6. What is a Route?

A **route** defines how your application responds to a particular URL and HTTP method.

Example:

```python
@app.get("/users")
def get_users():
    return {"users": 100}
```

This creates:

```text
GET /users
```

Another example:

```python
@app.get("/products")
def get_products():
    return {"products": 50}
```

creates:

```text
GET /products
```

So you can have multiple routes:

```text
GET     /users
GET     /products
POST    /users
PUT     /users/10
DELETE  /users/10
```

---

# 7. HTTP Methods

FastAPI supports standard HTTP methods.

The most important ones are:

| Method | Typical purpose |
|---|---|
| GET | Retrieve data |
| POST | Create/send data |
| PUT | Update/replace data |
| PATCH | Partially update data |
| DELETE | Delete data |

Example:

```python
@app.get("/users")
def get_users():
    ...
```

```python
@app.post("/users")
def create_user():
    ...
```

```python
@app.put("/users/{id}")
def update_user(id: int):
    ...
```

```python
@app.delete("/users/{id}")
def delete_user(id: int):
    ...
```

---

# 8. FastAPI Request-Response Model

The basic idea is:

```text
Client
   │
   │ Request
   ↓
FastAPI
   │
   │ Process request
   ↓
Your function
   │
   │ Result
   ↓
FastAPI
   │
   │ Response
   ↓
Client
```

For example:

```text
Client
   │
   │ GET /users
   ↓
FastAPI
   │
   ↓
get_users()
   │
   ↓
Database
   │
   ↓
User data
   │
   ↓
JSON response
```

---

# 9. FastAPI and Uvicorn

This is an important distinction from the previous topic.

**FastAPI is the web framework.**

**Uvicorn is the ASGI web server.**

Architecture:

```text
Client
   │
   │ HTTP
   ↓
Uvicorn
   │
   │ ASGI
   ↓
FastAPI
   │
   ↓
Your API code
```

You commonly start a FastAPI application using:

```bash
uvicorn main:app --reload
```

Here:

```text
main
 ↓
main.py

app
 ↓
FastAPI application object
```

---

# 10. Installing FastAPI

You can install FastAPI with:

```bash
pip install fastapi
```

For the Uvicorn server:

```bash
pip install uvicorn
```

Or commonly:

```bash
pip install "fastapi[standard]"
```

Then you can run your application using Uvicorn.

---

# 11. Running FastAPI

Suppose your file is:

```text
main.py
```

and contains:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Hello World"}
```

Run:

```bash
uvicorn main:app --reload
```

You should get something similar to:

```text
Uvicorn running on http://127.0.0.1:8000
```

Now visit:

```text
http://127.0.0.1:8000
```

You receive:

```json
{
    "message": "Hello World"
}
```

---

# 12. Automatic API Documentation

One of FastAPI's most useful features is **automatic API documentation**.

After starting your application:

```bash
uvicorn main:app --reload
```

go to:

```text
http://127.0.0.1:8000/docs
```

FastAPI provides an interactive Swagger UI.

You can see:

```text
GET     /
GET     /users
POST    /users
PUT     /users/{id}
DELETE  /users/{id}
```

You can even send requests directly from the browser.

FastAPI also provides ReDoc at:

```text
http://127.0.0.1:8000/redoc
```

---

# 13. Request Parameters

FastAPI makes it easy to accept data from requests.

### Path parameter

```python
@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"user_id": user_id}
```

Request:

```text
GET /users/10
```

FastAPI gives:

```python
user_id = 10
```

Notice:

```python
user_id: int
```

FastAPI knows that `user_id` should be an integer.

---

# 14. Query Parameters

Example:

```python
@app.get("/users")
def get_users(limit: int = 10):
    return {"limit": limit}
```

Request:

```text
/users?limit=20
```

FastAPI gives:

```python
limit = 20
```

---

# 15. Request Body

Suppose you want to create a user.

You can define a Pydantic model:

```python
from pydantic import BaseModel

class User(BaseModel):
    name: str
    age: int
```

Then:

```python
@app.post("/users")
def create_user(user: User):
    return user
```

The client sends:

```json
{
    "name": "Anirudh",
    "age": 22
}
```

FastAPI validates the data against:

```python
class User(BaseModel):
    name: str
    age: int
```

---

# 16. Pydantic and FastAPI

**Pydantic** is heavily used by FastAPI for data validation and serialization.

For example:

```python
class User(BaseModel):
    name: str
    age: int
```

means:

```text
name → must be a string
age  → must be an integer
```

If someone sends:

```json
{
    "name": "Anirudh",
    "age": "hello"
}
```

FastAPI/Pydantic can reject the request because:

```text
"hello" ≠ valid integer
```

This is one of FastAPI's major advantages.

---

# 17. Type Hints in FastAPI

FastAPI makes extensive use of Python type hints.

Example:

```python
@app.get("/users/{id}")
def get_user(id: int):
    ...
```

Here:

```python
id: int
```

tells FastAPI:

> `id` should be an integer.

Another example:

```python
def get_user(name: str, age: int):
    ...
```

Type hints help FastAPI with:

- Validation
- Documentation
- Request parsing
- Editor support
- Error messages

---

# 18. Synchronous vs Asynchronous Functions

FastAPI supports both.

### Normal function

```python
@app.get("/")
def home():
    return {"message": "Hello"}
```

### Async function

```python
@app.get("/")
async def home():
    return {"message": "Hello"}
```

Async functions are useful when you're working with asynchronous operations such as:

- Async database calls
- HTTP API calls
- File/network I/O
- Other asynchronous services

You don't need to make every FastAPI function `async`.

---

# 19. FastAPI with Databases

FastAPI itself is **not a database**.

It can communicate with databases such as:

- MySQL
- PostgreSQL
- SQLite
- MongoDB
- etc.

Architecture:

```text
Frontend
    ↓
FastAPI
    ↓
Database layer
    ↓
MySQL / PostgreSQL
```

For example:

```python
@app.get("/customers")
def get_customers():
    customers = database.get_customers()
    return customers
```

FastAPI handles the API layer.

The database handles data storage.

---

# 20. FastAPI for Data Engineering

FastAPI is particularly useful for exposing data-engineering functionality through APIs.

For example:

### ETL API

```text
POST /run-etl
```

### Pipeline status

```text
GET /pipeline/status
```

### Get processed data

```text
GET /sales
```

### Trigger data ingestion

```text
POST /ingestion
```

### Data validation

```text
POST /validate-data
```

Architecture:

```text
               Frontend
                  │
                  ↓
              FastAPI
                  │
       ┌──────────┼──────────┐
       ↓          ↓          ↓
     ETL       Database    External
   Pipeline                APIs
       │
       ↓
   Data Warehouse
```

So for a junior data engineer, FastAPI is useful when you need to **expose your data pipeline or data-processing functionality as an API**.

---

# 21. Advantages of FastAPI

### 1. Python-based

You can use your existing Python knowledge.

### 2. Fast

FastAPI is designed around modern Python asynchronous capabilities and the ASGI ecosystem.

### 3. Automatic validation

Pydantic handles much of the request-data validation.

### 4. Automatic documentation

FastAPI automatically generates:

```text
/docs
/redoc
```

### 5. Type hints

Python type annotations are heavily integrated into the framework.

### 6. Async support

You can use:

```python
async def
```

for asynchronous workloads.

### 7. Easy API development

You can create a working API with relatively little code.

---

# 22. FastAPI Architecture

A simple FastAPI application:

```text
                Client
                  │
                  │ HTTP
                  ↓
              Uvicorn
                  │
                 ASGI
                  │
                  ↓
              FastAPI
                  │
            ┌─────┴─────┐
            ↓           ↓
         Router      Validation
            │           │
            └─────┬─────┘
                  ↓
             Service
                  │
                  ↓
           Database / API
```

As your application becomes larger, you might organize it as:

```text
project/
│
├── main.py
│
├── routers/
│   ├── users.py
│   └── products.py
│
├── services/
│   ├── user_service.py
│   └── product_service.py
│
├── models/
│   └── user.py
│
├── schemas/
│   └── user.py
│
└── database/
    └── connection.py
```

You don't need this structure for a small application, but it becomes useful as the project grows.

---

# 23. FastAPI vs Flask

Both are Python web frameworks.

| FastAPI | Flask |
|---|---|
| Modern Python framework | Lightweight Python framework |
| ASGI ecosystem | Traditionally WSGI |
| Excellent type-hint integration | Less type-hint-centric |
| Automatic API documentation | Usually requires extensions/manual setup |
| Pydantic validation | Usually requires additional libraries/manual validation |
| Built-in async support | Async support exists but architecture differs |
| Excellent for API development | General web development and APIs |

For learning modern Python APIs, FastAPI is a very useful framework to know.

---

# 24. FastAPI vs Django

They serve somewhat different purposes.

### FastAPI

Primarily excellent for:

```text
APIs
Microservices
Backend services
ML/AI APIs
Data APIs
Async APIs
```

### Django

A much larger web framework that provides many built-in features for full web applications.

```text
Django
 ├── ORM
 ├── Authentication
 ├── Admin
 ├── Templates
 ├── Routing
 └── APIs
```

FastAPI is generally more focused on API/service development.

---

# 25. Important FastAPI Terminology

As you continue learning, these terms will appear frequently:

| Term | Meaning |
|---|---|
| **FastAPI** | Python web framework |
| **Uvicorn** | ASGI web server |
| **ASGI** | Interface between server and Python application |
| **Route** | URL + HTTP method handled by the application |
| **Endpoint** | A specific API operation exposed by the application |
| **Path parameter** | Parameter embedded in URL path |
| **Query parameter** | Parameter after `?` |
| **Request body** | Data sent in request body |
| **Pydantic** | Data validation/modeling library |
| **Middleware** | Code that runs around request/response processing |
| **Dependency Injection** | Mechanism for providing required components/data |
| **Router** | Way to organize related API routes |
| **Swagger UI** | Interactive API documentation |
| **ReDoc** | Alternative API documentation interface |

---

# 26. The Complete Mental Model

Keep this architecture in your head while learning FastAPI:

```text
                     CLIENT
                       │
                       │ HTTP Request
                       ↓
                ┌─────────────┐
                │   Uvicorn   │
                │ Web Server  │
                └──────┬──────┘
                       │
                      ASGI
                       │
                       ↓
                ┌─────────────┐
                │   FastAPI   │
                │  Framework  │
                └──────┬──────┘
                       │
                    Routing
                       │
                       ↓
                ┌─────────────┐
                │ Validation  │
                │  Pydantic   │
                └──────┬──────┘
                       │
                       ↓
                ┌─────────────┐
                │ Your Logic  │
                │  Services   │
                └──────┬──────┘
                       │
             ┌─────────┴─────────┐
             ↓                   ↓
         Database           External API
             │
             ↓
          Response
             │
             ↓
          FastAPI
             │
             ↓
          Uvicorn
             │
             ↓
           Client
```

## Key takeaway

If you remember only this:

> **FastAPI is a Python framework for building APIs.**

> **Uvicorn is the ASGI web server that runs the FastAPI application and handles network communication.**

> **FastAPI handles things like routing, validation, dependencies, and application logic.**

> **Pydantic handles data validation/modeling.**

> **The client communicates with FastAPI through HTTP.**

A good next learning sequence is:

**HTTP basics → FastAPI application → routes → path/query parameters → request body → Pydantic → response models → routers → dependencies → middleware → database integration → authentication → async → project structure.**