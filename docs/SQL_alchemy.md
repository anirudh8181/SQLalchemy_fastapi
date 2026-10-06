![alt text](image.png)

![alt text](image-1.png)

# SQLAlchemy and ORM

## 1. The problem

Right now our products live in a Python list. When the server restarts, every
product we added or deleted is lost. To keep data permanently we need a
**database** (SQLite, PostgreSQL, MySQL, ...).

Databases speak **SQL**:

```sql
SELECT * FROM product WHERE id = 1;
INSERT INTO product (name, price) VALUES ('Pen', 1.99);
```

Writing raw SQL strings inside Python works, but it is easy to make mistakes,
and the results come back as plain tuples instead of nice objects.

## 2. What is an ORM?

**ORM = Object Relational Mapper.** It maps (connects):

| Database world   | Python world            |
|------------------|-------------------------|
| Table `product`  | Class `Product`         |
| Column `name`    | Attribute `product.name`|
| One row          | One object              |

That is exactly what the picture above shows: row `1 | Phone | ...` in the
`product` table becomes **obj 1**, and row 2 becomes **obj 2**.

With an ORM you work with Python objects, and the ORM writes the SQL for you.

```python
# Without ORM (raw SQL)
cursor.execute("SELECT * FROM product WHERE id = 1")

# With ORM
session.get(Product, 1)
```

**SQLAlchemy** is the most popular ORM library for Python.

## 3. Install

```bash
pip install --upgrade sqlalchemy
```

These notes use **SQLAlchemy 2.x** style (`DeclarativeBase`, `Mapped`,
`mapped_column`). Check your version with
`python -c "import sqlalchemy; print(sqlalchemy.__version__)"`. On 1.4 you
get `ImportError: cannot import name 'DeclarativeBase'` — upgrade to fix it.

SQLite comes built into Python, so we use it for the examples (no database
server needed). It stores everything in a single file, `products.db`.

## 4. The 4 building blocks

| Piece        | What it is                                                 |
|--------------|------------------------------------------------------------|
| **Engine**   | The connection to the database (where it is, which kind).  |
| **Base**     | Parent class; every table class inherits from it.          |
| **Model**    | A Python class that describes one table.                   |
| **Session**  | A "workspace" where you add, read, change and delete rows. |

### 4.1 Engine — connect to the database

```python
from sqlalchemy import create_engine

engine = create_engine("sqlite:///products.db", echo=True)
```

- `sqlite:///products.db` is the **database URL**. For PostgreSQL it would look
  like `postgresql://user:password@localhost:5432/mydb`.
- `echo=True` prints the SQL that SQLAlchemy generates. Great for learning.

### 4.2 Base and Model — describe the table

```python
from sqlalchemy import String, Float, Integer
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Product(Base):
    __tablename__ = "product"          # name of the table in the database

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)
    price: Mapped[float] = mapped_column(Float)
    quantity: Mapped[int] = mapped_column(Integer)
```

Compare this with the table in the picture:

| Picture                       | Code                                      |
|-------------------------------|-------------------------------------------|
| `id [PK] integer`             | `mapped_column(Integer, primary_key=True)`|
| `name character varying`      | `mapped_column(String)`                   |
| `price double precision`      | `mapped_column(Float)`                    |
| `quantity integer`            | `mapped_column(Integer)`                  |

`PK` = **primary key**: a unique id for every row. With `primary_key=True`
the database fills in the id automatically (1, 2, 3, ...) if you don't give one.

### 4.3 Create the tables

```python
Base.metadata.create_all(engine)
```

This looks at every class that inherits from `Base` and runs
`CREATE TABLE ...` for any table that does not exist yet.

### 4.4 Session — talk to the database

```python
from sqlalchemy.orm import sessionmaker

SessionLocal = sessionmaker(bind=engine)
```

`SessionLocal` is a factory: each call `SessionLocal()` gives you a new
session. Use it with `with` so it is closed automatically:

```python
with SessionLocal() as session:
    ...   # work with the database here
```

## 5. CRUD examples

CRUD = **C**reate, **R**ead, **U**pdate, **D**elete. These match the
endpoints we already built with the Python list.

### Create (INSERT)

```python
with SessionLocal() as session:
    phone = Product(name="Phone", description="A smartphone", price=699.99, quantity=50)
    laptop = Product(name="Laptop", description="A useful laptop", price=999.99, quantity=30)

    session.add(phone)               # one object
    session.add_all([laptop])        # many objects
    session.commit()                 # actually save to the database

    print(phone.id)                  # 1  -> filled in by the database
```

- `add()` only puts the object in the session's "to do" list.
- `commit()` sends the `INSERT` to the database and saves it permanently.
  **Forget `commit()` and nothing is saved.**

### Read (SELECT)

```python
from sqlalchemy import select

with SessionLocal() as session:
    # one product by primary key
    product = session.get(Product, 1)
    print(product.name)              # Phone

    # all products
    products = session.scalars(select(Product)).all()

    # with a condition (WHERE)
    cheap = session.scalars(
        select(Product).where(Product.price < 100)
    ).all()

    # first match, or None if nothing found
    pen = session.scalars(
        select(Product).where(Product.name == "Pen")
    ).first()
```

| ORM code                                   | SQL it generates                         |
|--------------------------------------------|------------------------------------------|
| `session.get(Product, 1)`                  | `SELECT ... WHERE id = 1`                |
| `select(Product)`                          | `SELECT * FROM product`                  |
| `.where(Product.price < 100)`              | `... WHERE price < 100`                  |
| `.order_by(Product.price)`                 | `... ORDER BY price`                     |

`session.get()` returns `None` when the id doesn't exist, so always check it.

### Update

```python
with SessionLocal() as session:
    product = session.get(Product, 1)
    if product:
        product.price = 649.99       # just change the attribute
        product.quantity = 45
        session.commit()             # SQLAlchemy runs the UPDATE
```

No SQL needed: change the object, then `commit()`.

### Delete

```python
with SessionLocal() as session:
    product = session.get(Product, 2)
    if product:
        session.delete(product)
        session.commit()
```

## 6. Full runnable example

Save as `orm_demo.py` and run `python orm_demo.py`:

```python
from sqlalchemy import create_engine, select, String, Float, Integer
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

engine = create_engine("sqlite:///products.db")
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


class Product(Base):
    __tablename__ = "product"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)
    price: Mapped[float] = mapped_column(Float)
    quantity: Mapped[int] = mapped_column(Integer)


Base.metadata.create_all(engine)

with SessionLocal() as session:
    # Create
    session.add_all([
        Product(name="Phone", description="A smartphone", price=699.99, quantity=50),
        Product(name="Laptop", description="A useful laptop", price=999.99, quantity=30),
        Product(name="Pen", description="A blue ink pen", price=1.99, quantity=100),
        Product(name="Table", description="A brown table", price=199.99, quantity=20),
    ])
    session.commit()

    # Read
    for p in session.scalars(select(Product)).all():
        print(p.id, p.name, p.price)

    # Update
    pen = session.get(Product, 3)
    pen.price = 2.49
    session.commit()

    # Delete
    table = session.get(Product, 4)
    session.delete(table)
    session.commit()

    print([p.name for p in session.scalars(select(Product)).all()])
    # ['Phone', 'Laptop', 'Pen']
```

Running it a second time adds the 4 products again (ids 5–8), because the
data is now **saved in `products.db`**, not lost like our Python list.
Delete `products.db` to start fresh.

## 7. SQLAlchemy model vs Pydantic model

We now have two kinds of `Product` class. They do different jobs:

|                | Pydantic `Product` (`models.py`)        | SQLAlchemy `Product`                 |
|----------------|-----------------------------------------|--------------------------------------|
| Inherits from  | `BaseModel`                             | `Base` (`DeclarativeBase`)           |
| Job            | Validate request/response JSON in the API | Read/write rows in the database    |
| Lives          | Only in memory                          | Saved in the database                |

In a FastAPI app you usually keep both: Pydantic checks what the user sends,
and SQLAlchemy stores it. Give them different names to avoid confusion,
for example `ProductSchema` (Pydantic) and `Product` (SQLAlchemy).

## 8. Quick summary

1. `create_engine(url)` — connect to the database.
2. `class Product(Base)` — one class = one table, one attribute = one column.
3. `Base.metadata.create_all(engine)` — create the tables.
4. `with SessionLocal() as session:` — open a session.
5. `add` / `get` / `select` / change attribute / `delete`, then **`commit()`**.

## 9. SQLAlchemy ↔ MySQL datatype mapping

| SQLAlchemy type | MySQL type it creates | Typical use | Notes |
|---|---|---|---|
| `Integer` | `INT` | ids, counts, quantity | Range is about ±2.1 billion |
| `SmallInteger` | `SMALLINT` | small codes | Range is about ±32k |
| `BigInteger` | `BIGINT` | large ids, counters | |
| `Float` | `FLOAT` | measurements | Approximate, so avoid it for money |
| `Numeric(10, 2)` | `DECIMAL(10,2)` | **prices, money** | Exact; returns Python `Decimal` |
| `String(255)` | `VARCHAR(255)` | names, emails, short text | **A length is required on MySQL** |
| `Text` | `TEXT` | descriptions, long text | No length needed; holds up to 64 KB |
| `Boolean` | `TINYINT(1)` / `BOOL` | true/false flags | Stored as 0 or 1 |
| `Date` | `DATE` | birthdays | Python `date` |
| `DateTime` | `DATETIME` | created_at, updated_at | Python `datetime` |
| `Time` | `TIME` | time of day | |
| `Enum("a", "b")` | `ENUM('a','b')` | status fields | |
| `JSON` | `JSON` | flexible structured data | Needs MySQL 5.7 or newer |
| `LargeBinary` | `BLOB` | files, bytes | |
