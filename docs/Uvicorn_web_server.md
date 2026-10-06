

# Web Server & Uvicorn 

## 1. What is a Web Server?

A **web server is a software program that listens for requests from clients over a network and sends responses back to those clients.**

The client could be:

- Web browser
- Frontend JavaScript application
- Mobile application
- Postman
- Another backend service
- Python `requests`
- Another API

Basic flow:

```text
Client
   |
   | HTTP Request
   ↓
Web Server
   |
   | passes request to application
   ↓
Application
   |
   | generates response
   ↓
Web Server
   |
   | HTTP Response
   ↓
Client
```

---

# 2. Why Do We Need a Web Server?

Suppose you write this FastAPI application:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/hello")
def hello():
    return {"message": "Hello World"}
```

You have defined an API, but your Python code by itself isn't listening for network connections.

Something needs to:

```text
Listen on a port
       ↓
Accept network connections
       ↓
Receive HTTP requests
       ↓
Pass them to your application
       ↓
Receive the application's response
       ↓
Send the response back
```

That "something" is a **web server**.

For FastAPI, **Uvicorn** is commonly used.

---

# 3. What Does a Web Server Actually Do?

A web server has several important responsibilities.

### 1. Listen for connections

For example:

```text
127.0.0.1:8000
```

Here:

```text
127.0.0.1 → IP address
8000      → port
```

Uvicorn listens on this address.

---

### 2. Receive requests

Suppose a browser sends:

```http
GET /users HTTP/1.1
Host: localhost:8000
```

The web server receives this network request.

---

### 3. Communicate with the application

The web server needs a standardized way to communicate with the Python application.

For modern Python asynchronous applications, that standard is **ASGI**.

```text
HTTP
 ↓
Uvicorn
 ↓
ASGI
 ↓
FastAPI
```

---

### 4. Send the response back

FastAPI might produce:

```python
{
    "users": 100
}
```

Uvicorn then sends the HTTP response back to the client.

---

# 4. Web Server vs Web Framework

This is one of the most important concepts.

### Web server

Responsible primarily for **network communication and serving the application**.

Examples:

- Uvicorn
- Gunicorn
- Apache HTTP Server
- Nginx
- IIS

### Web framework

Responsible for helping you **build the application/API**.

Examples:

- FastAPI
- Django
- Flask
- Express.js
- Spring Boot

So:

```text
WEB SERVER
    ↓
Uvicorn

WEB FRAMEWORK
    ↓
FastAPI
```

They are not the same thing.

---

# 5. What is Uvicorn?

**Uvicorn is an ASGI web server for Python.**

It is commonly used to run applications built with:

- FastAPI
- Starlette
- other ASGI-compatible Python applications

The important words are:

> **Uvicorn = ASGI web server**

---

# 6. What is ASGI?

ASGI stands for:

**Asynchronous Server Gateway Interface**

It is a standard interface between:

```text
Python web server
        ↕
Python web application
```

For example:

```text
        Uvicorn
           |
           | ASGI
           |
        FastAPI
```

Uvicorn doesn't need to know the internal implementation of your FastAPI application.

It only needs to know:

> "This application follows the ASGI specification."

---

# 7. Why Is ASGI Important?

Historically, Python had **WSGI**:

```text
Web Server
    ↓
  WSGI
    ↓
Flask / Django
```

WSGI was designed primarily around synchronous request handling.

ASGI was created to support modern asynchronous Python applications.

```text
Web Server
    ↓
  ASGI
    ↓
FastAPI
```

This allows applications to work with:

- asynchronous functions
- concurrent connections
- WebSockets
- long-running asynchronous operations

For example:

```python
@app.get("/data")
async def get_data():
    result = await some_async_operation()
    return result
```

Uvicorn is designed to run this type of application.

---

# 8. How Uvicorn Runs a FastAPI Application

Suppose your project looks like this:

```text
project/
│
├── main.py
└── ...
```

`main.py`:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Hello"}
```

You run:

```bash
uvicorn main:app
```

The syntax:

```text
uvicorn main:app
        │    │
        │    └── FastAPI object
        │
        └── Python module
```

So:

```text
main:app
```

means:

> Import the `app` object from `main.py`.

---

# 9. What Happens When Uvicorn Starts?

When you execute:

```bash
uvicorn main:app
```

conceptually:

```text
Start Uvicorn
      ↓
Import main.py
      ↓
Find "app"
      ↓
Find FastAPI application
      ↓
Start listening on a port
      ↓
Wait for requests
```

Usually:

```text
127.0.0.1:8000
```

---

# 10. Complete Request Flow

Suppose you have:

```python
@app.get("/users")
def get_users():
    return {
        "users": 100
    }
```

The user opens:

```text
http://localhost:8000/users
```

The complete flow is approximately:

```text
┌──────────────────────┐
│ Browser / Postman    │
└──────────┬───────────┘
           │
           │ HTTP GET /users
           ↓
┌──────────────────────┐
│ Uvicorn              │
│ Web Server            │
└──────────┬───────────┘
           │
           │ ASGI
           ↓
┌──────────────────────┐
│ FastAPI              │
│ Application          │
└──────────┬───────────┘
           │
           │ Routing
           ↓
┌──────────────────────┐
│ get_users()          │
└──────────┬───────────┘
           │
           │ return data
           ↓
┌──────────────────────┐
│ FastAPI response     │
└──────────┬───────────┘
           │
           │ ASGI
           ↓
┌──────────────────────┐
│ Uvicorn              │
└──────────┬───────────┘
           │
           │ HTTP Response
           ↓
┌──────────────────────┐
│ Browser / Postman    │
└──────────────────────┘
```

---

# 11. Very Important: Uvicorn Does NOT Handle Routing

This distinction is important.

Suppose you have:

```python
@app.get("/users")
def users():
    return {"data": "users"}

@app.get("/products")
def products():
    return {"data": "products"}
```

If the client sends:

```text
GET /products
```

**FastAPI's routing system** determines:

```text
/products
    ↓
products()
```

Uvicorn's job is primarily:

```text
Receive HTTP request
        ↓
Make it available to ASGI application
        ↓
Receive response
        ↓
Send HTTP response
```

So:

> **Uvicorn receives and communicates the request; FastAPI performs application-level routing.**

---

# 12. Uvicorn's Position

You can visualize the architecture as:

```text
             Internet / Network
                    │
                    ↓
              HTTP Request
                    │
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
             │ Your Python │
             │   Function  │
             └─────────────┘
```

---

# 13. What is a Port?

When Uvicorn starts, you might see:

```text
Uvicorn running on http://127.0.0.1:8000
```

The `8000` is the **port**.

Think of an IP address as a building:

```text
127.0.0.1
```

and ports as different doors:

```text
:8000 → FastAPI
:3000 → React
:5432 → PostgreSQL
:3306 → MySQL
```

So:

```text
127.0.0.1:8000
```

means:

```text
IP address + port
```

---

# 14. Host and Port in Uvicorn

You can specify:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### `--host`

Determines which network interface/address Uvicorn listens on.

### `--port`

Determines which port it listens on.

For example:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

means:

```text
Listen on all available network interfaces
             +
Listen on port 8000
```

This is commonly useful when running inside Docker or when another machine needs to access the service.

---

# 15. What is `--reload`?

You will frequently see:

```bash
uvicorn main:app --reload
```

`--reload` means:

> Automatically restart/reload the development server when your source code changes.

Example:

```text
You modify main.py
       ↓
Uvicorn detects change
       ↓
Application reloads
       ↓
New code becomes active
```

This is mainly a **development feature**, not something you normally use in production.

---

# 16. Uvicorn and JSON

Suppose FastAPI returns:

```python
return {
    "name": "Anirudh",
    "age": 22
}
```

FastAPI converts the Python data into an HTTP-compatible response, typically JSON.

The overall process is:

```text
Python dictionary
       ↓
FastAPI
       ↓
JSON response
       ↓
Uvicorn
       ↓
HTTP response
       ↓
Client
```

---

# 17. Uvicorn Is Not Your Business Logic

Suppose you have:

```python
@app.get("/sales")
def get_sales():
    sales = database.query(...)
    return sales
```

Uvicorn doesn't know anything about:

- sales
- customers
- databases
- business rules
- SQL
- authentication logic

Those belong to your application.

Uvicorn is concerned with the **server/network side**.

---

# 18. Uvicorn vs FastAPI

| Uvicorn | FastAPI |
|---|---|
| Web server | Web framework |
| Runs the application | Defines the application |
| Handles network communication | Handles API logic |
| ASGI server | ASGI framework |
| Listens on ports | Defines routes |
| Receives HTTP requests | Processes requests |
| Sends HTTP responses | Creates responses |
| Doesn't contain your business logic | Contains your API/business logic |

---

# 19. Uvicorn vs Nginx

You may eventually encounter Nginx.

They can both participate in serving an application, but their roles can differ.

A production architecture could look like:

```text
Internet
   ↓
Nginx
   ↓
Uvicorn
   ↓
FastAPI
   ↓
Database
```

### Nginx

Often used as a:

- Reverse proxy
- Load balancer
- TLS/SSL termination point
- Static-file server

### Uvicorn

Acts as the:

- ASGI application server
- Interface between network traffic and FastAPI

---

# 20. Uvicorn vs Gunicorn

You may also hear:

```text
Gunicorn
Uvicorn
```

They are not exactly interchangeable.

A common architecture is:

```text
Gunicorn
   ↓
Uvicorn workers
   ↓
FastAPI
```

Gunicorn can manage multiple worker processes, while Uvicorn provides the ASGI server implementation used by those workers.

For learning FastAPI, however, you can initially focus on:

```text
Uvicorn → FastAPI
```

---

# 21. Web Server vs Application Server

You'll encounter these terms in backend development.

A simplified distinction:

### Web server

Concerned with:

```text
HTTP
Network connections
Requests
Responses
Connections
Ports
```

### Application

Concerned with:

```text
Routes
Business logic
Database operations
Authentication
Validation
Data processing
```

With FastAPI:

```text
Uvicorn
   ↓
Server layer

FastAPI
   ↓
Application/framework layer
```

The terminology can become more nuanced in production architectures, so don't worry about making the distinction perfectly rigid at this stage.

---

# 22. Example: Data Engineering API

Since you're learning FastAPI from a **data-engineering perspective**, imagine you build an API that starts an ETL job.

```python
@app.post("/run-etl")
def run_etl():
    # extract
    # transform
    # load

    return {"status": "completed"}
```

The architecture could be:

```text
Frontend
   │
   │ POST /run-etl
   ↓
Uvicorn
   │
   │ ASGI
   ↓
FastAPI
   │
   │ routing
   ↓
run_etl()
   │
   ├── Extract
   ├── Transform
   └── Load
   │
   ↓
Database
```

Here:

**Uvicorn does not perform the ETL.**

It only helps your API server communicate with the client.

---

# 23. What Happens When You Use Swagger UI?

FastAPI automatically provides:

```text
/docs
```

So you can visit:

```text
http://localhost:8000/docs
```

The flow is:

```text
Browser
   ↓
GET /docs
   ↓
Uvicorn
   ↓
FastAPI
   ↓
Swagger UI
   ↓
Browser
```

When you click **Execute** on an endpoint:

```text
Swagger UI
    ↓
HTTP request
    ↓
Uvicorn
    ↓
FastAPI
    ↓
Your function
    ↓
Response
    ↓
Uvicorn
    ↓
Swagger UI
```

This is the same request/response architecture.

---

# 24. The Most Important Mental Model

Remember this:

```text
                  CLIENT
                    │
                    │ HTTP
                    ↓
              ┌───────────┐
              │  UVICORN  │
              │ Web Server│
              └─────┬─────┘
                    │
                   ASGI
                    │
                    ↓
              ┌───────────┐
              │  FASTAPI  │
              │ Framework │
              └─────┬─────┘
                    │
                 Routing
                    │
                    ↓
              ┌───────────┐
              │ YOUR CODE │
              │ Functions │
              └─────┬─────┘
                    │
                    ↓
                Database
```

### In one sentence:

> **Uvicorn is the ASGI web server that listens for network/HTTP requests, communicates those requests to your FastAPI application, and sends the application's responses back to the client.**

And:

> **FastAPI is the framework that handles routing, validation, dependency injection, request processing, and response generation.**

### The 4 terms you should remember

| Term | Meaning |
|---|---|
| **HTTP** | Protocol used for communication |
| **Web Server** | Program that accepts network/HTTP requests and sends responses |
| **Uvicorn** | ASGI web server used to run FastAPI |
| **FastAPI** | Python web framework used to build APIs |

