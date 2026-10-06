# HTTP Methods in FastAPI

## 1. What is an HTTP Method?

Every HTTP request carries a **method** (also called a **verb**) that tells the server **what kind of action** the client wants to perform on a resource.

```text
METHOD   URL            → meaning
GET      /users/42      → "give me user 42"
DELETE   /users/42      → "remove user 42"
```

Same URL, different method → different action.

In FastAPI, each method has its own **path operation decorator** on the `app` (or an `APIRouter`):

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items")      # GET
@app.post("/items")     # POST
@app.put("/items/1")    # PUT
@app.patch("/items/1")  # PATCH
@app.delete("/items/1") # DELETE
@app.head("/items")     # HEAD
@app.options("/items")  # OPTIONS
@app.trace("/items")    # TRACE
```

---

# 2. All Methods Available in FastAPI

| Decorator          | Method    | Purpose                              | Has request body? | Safe? | Idempotent? | Typical success code |
| ------------------ | --------- | ------------------------------------ | ----------------- | ----- | ----------- | -------------------- |
| `@app.get()`       | `GET`     | Read / fetch a resource              | No                | Yes   | Yes         | `200 OK`             |
| `@app.post()`      | `POST`    | Create a new resource / run an action| Yes               | No    | No          | `201 Created`        |
| `@app.put()`       | `PUT`     | Replace a resource completely        | Yes               | No    | Yes         | `200 OK`             |
| `@app.patch()`     | `PATCH`   | Update part of a resource            | Yes               | No    | Not always  | `200 OK`             |
| `@app.delete()`    | `DELETE`  | Remove a resource                    | Usually no        | No    | Yes         | `204 No Content`     |
| `@app.head()`      | `HEAD`    | Same as GET, but headers only        | No                | Yes   | Yes         | `200 OK`             |
| `@app.options()`   | `OPTIONS` | Ask which methods are allowed (CORS) | No                | Yes   | Yes         | `200 OK`             |
| `@app.trace()`     | `TRACE`   | Echo the request back (debugging)    | No                | Yes   | Yes         | `200 OK`             |

**Safe** → does not change data on the server.
**Idempotent** → calling it once or 10 times leaves the server in the same state.

> The first five (GET, POST, PUT, PATCH, DELETE) are the ones you will use 99% of the time. They map directly to **CRUD**.

```text
Create → POST
Read   → GET
Update → PUT / PATCH
Delete → DELETE
```

---

# 3. Example Setup

All examples below share this in-memory "database" and model:

```python
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    in_stock: bool = True

class ItemUpdate(BaseModel):          # all fields optional, for PATCH
    name: str | None = None
    price: float | None = None
    in_stock: bool | None = None

items: dict[int, Item] = {
    1: Item(name="Pen", price=10.0),
    2: Item(name="Book", price=250.0),
}
```

---

# 4. GET: Read Data

Used to **fetch** data. Never changes anything on the server.

```python
# Get all items (with optional query parameter)
@app.get("/items")
def list_items(in_stock: bool | None = None):
    if in_stock is None:
        return items
    return {k: v for k, v in items.items() if v.in_stock == in_stock}

# Get one item by path parameter
@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    return items[item_id]
```

```text
GET /items              → all items
GET /items?in_stock=true → filtered with a query parameter
GET /items/1            → {"name": "Pen", "price": 10.0, "in_stock": true}
GET /items/99           → 404 {"detail": "Item not found"}
```

Key points:

- Input comes from **path parameters** (`/items/{item_id}`) and **query parameters** (`?in_stock=true`)
- No request body

---

# 5. POST: Create Data

Used to **create** a new resource. The data is sent in the **request body** (JSON).

```python
@app.post("/items", status_code=status.HTTP_201_CREATED)
def create_item(item: Item):
    new_id = max(items) + 1 if items else 1
    items[new_id] = item
    return {"id": new_id, **item.model_dump()}
```

```text
POST /items
Body: {"name": "Bag", "price": 999.0}

→ 201 Created
  {"id": 3, "name": "Bag", "price": 999.0, "in_stock": true}
```

Key points:

- A Pydantic model parameter (`item: Item`) tells FastAPI to read and **validate** the JSON body
- Invalid body → FastAPI automatically returns `422 Unprocessable Entity`
- Not idempotent: sending it twice creates **two** items

---

# 6. PUT: Replace Data

Used to **replace the whole resource**. The client sends the **complete** object.

```python
@app.put("/items/{item_id}")
def replace_item(item_id: int, item: Item):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    items[item_id] = item
    return item
```

```text
PUT /items/1
Body: {"name": "Gel Pen", "price": 15.0, "in_stock": false}

→ 200 OK  (item 1 is now fully replaced)
```

Key points:

- All required fields must be sent; missing ones fail validation
- Idempotent: sending the same PUT twice gives the same result

---

# 7. PATCH: Partial Update

Used to **update only some fields** of a resource.

```python
@app.patch("/items/{item_id}")
def update_item(item_id: int, changes: ItemUpdate):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    stored = items[item_id]
    update_data = changes.model_dump(exclude_unset=True)   # only fields the client sent
    items[item_id] = stored.model_copy(update=update_data)
    return items[item_id]
```

```text
PATCH /items/1
Body: {"price": 12.0}

→ 200 OK  {"name": "Pen", "price": 12.0, "in_stock": true}
```

Key points:

- Use a model with **all-optional fields** (`ItemUpdate`)
- `exclude_unset=True` keeps fields the client did not send unchanged

### PUT vs PATCH

```text
Stored:  {"name": "Pen", "price": 10.0, "in_stock": true}

PUT   {"name": "Pen", "price": 12.0, "in_stock": true}  → must send everything
PATCH {"price": 12.0}                                    → send only what changes
```

---

# 8. DELETE: Remove Data

Used to **delete** a resource.

```python
@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    del items[item_id]
```

```text
DELETE /items/2  → 204 No Content (empty body)
DELETE /items/2  → 404 (already gone, but server state is the same → idempotent)
```

---

# 9. HEAD: Headers Only

Same as `GET`, but the server returns **only the headers, no body**. Useful to check if a resource exists or read its size/last-modified time without downloading it.

```python
@app.head("/items/{item_id}")
def item_exists(item_id: int):
    if item_id not in items:
        raise HTTPException(status_code=404)
    # body is discarded for HEAD; only status + headers are sent
```

---

# 10. OPTIONS: What Is Allowed?

Asks the server which methods/headers are allowed on a URL. Browsers send it automatically as a **CORS preflight** request before cross-origin calls.

You rarely write it yourself; `CORSMiddleware` handles it:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

If you need a custom one:

```python
from fastapi import Response

@app.options("/items")
def items_options():
    return Response(headers={"Allow": "GET, POST, OPTIONS"})
```

---

# 11. TRACE: Echo for Debugging

Echoes the received request back to the client, for debugging proxies. It is usually **disabled in production** for security reasons. FastAPI supports it (`@app.trace()`), but you will almost never use it.

---

# 12. One Function, Multiple Methods: `api_route`

To handle several methods with a single function, use `@app.api_route()`:

```python
from fastapi import Request

@app.api_route("/ping", methods=["GET", "POST"])
def ping(request: Request):
    return {"method": request.method}
```

The same `methods=[...]` option exists on `APIRouter.api_route()`.

---

# 13. Using Methods with `APIRouter`

In larger apps you split routes into routers. The same decorators exist on `APIRouter`:

```python
from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
def list_users(): ...

@router.post("/", status_code=201)
def create_user(): ...

@router.get("/{user_id}")
def get_user(user_id: int): ...

@router.put("/{user_id}")
def replace_user(user_id: int): ...

@router.patch("/{user_id}")
def update_user(user_id: int): ...

@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int): ...

app.include_router(router)
```

---

# 14. Common Decorator Options

Every method decorator accepts the same useful arguments:

```python
@app.post(
    "/items",
    status_code=201,             # default success code
    response_model=Item,         # shape/filter of the response
    tags=["items"],              # grouping in /docs
    summary="Create an item",    # title in /docs
    description="Adds a new item to the store.",
    deprecated=False,            # mark as deprecated in /docs
)
def create_item(item: Item):
    return item
```

---

# 15. Where Does the Input Come From?

| Source            | FastAPI syntax                       | Typical methods        |
| ----------------- | ------------------------------------ | ---------------------- |
| Path parameter    | `/items/{item_id}` + `item_id: int`  | GET, PUT, PATCH, DELETE|
| Query parameter   | `q: str \| None = None`              | GET (mostly)           |
| Request body      | `item: Item` (Pydantic model)        | POST, PUT, PATCH       |
| Headers           | `user_agent: str = Header()`         | Any                    |
| Cookies           | `session_id: str = Cookie()`         | Any                    |
| Form data         | `username: str = Form()`             | POST                   |
| Files             | `file: UploadFile`                   | POST                   |

---

# 16. Quick Summary

```text
GET     → read            → no body       → 200
POST    → create          → body          → 201
PUT     → replace all     → full body     → 200
PATCH   → update part     → partial body  → 200
DELETE  → remove          → no body       → 204
HEAD    → GET w/o body    → no body       → 200
OPTIONS → allowed methods → no body       → 200  (CORS)
TRACE   → echo/debug      → no body       → 200  (rarely used)
```

> Run your app with `uvicorn main:app --reload` and open **http://127.0.0.1:8000/docs** to try every method interactively in Swagger UI.
