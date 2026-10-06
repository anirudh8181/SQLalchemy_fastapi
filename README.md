# SQLAlchemy FastAPI

A simple full-stack CRUD application for managing products, built with **FastAPI** + **SQLAlchemy** on the backend and **React (Vite)** on the frontend.

## Features

- REST API for creating, reading, updating, and deleting products
- MySQL persistence via SQLAlchemy ORM
- Pydantic models for request/response validation
- React frontend for searching, listing, adding, and editing products
- CORS enabled for local frontend/backend development

## Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/)
- [SQLAlchemy](https://www.sqlalchemy.org/)
- [PyMySQL](https://pypi.org/project/PyMySQL/)
- [Uvicorn](https://www.uvicorn.org/)

**Frontend**
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)

## Project Structure

```
.
├── main.py              # FastAPI app and route definitions
├── models.py             # Pydantic schemas
├── db_models.py          # SQLAlchemy ORM models
├── database.py           # Database engine/session setup
├── insert_script.sql     # Sample data / table setup script
├── explain/               # Learning notes and example scripts
├── docs/                  # Reference notes on FastAPI, REST, SQLAlchemy concepts
└── frontend/              # React + Vite frontend
    └── src/
        ├── App.jsx
        ├── api.js
        └── components/
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL server running locally

### Backend Setup

1. Create and activate a virtual environment:
   ```bash
   python -m venv myenv
   myenv\Scripts\activate      # Windows
   source myenv/bin/activate   # macOS/Linux
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a MySQL database and update the connection string in `database.py`:
   ```python
   DATABASE_URL = "mysql+pymysql://<user>:<password>@localhost:3306/<database>"
   ```
4. Run the API:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://127.0.0.1:8000`, with interactive docs at `http://127.0.0.1:8000/docs`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` (default Vite port).

## API Endpoints

| Method | Endpoint               | Description             |
|--------|------------------------|--------------------------|
| GET    | `/`                    | Health check / greeting |
| GET    | `/products`            | List all products       |
| GET    | `/product/{id}`        | Get a product by ID     |
| POST   | `/add/product`         | Create a new product    |
| PUT    | `/product`             | Update an existing product |
| DELETE | `/delete/product/{id}` | Delete a product         |

## License

This project is for learning purposes and is not currently licensed for production use.
