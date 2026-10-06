from sqlalchemy import create_engine, text

DATABASE_URL = "mysql+pymysql://root:aniadmin@localhost:3306/apidata"

engine = create_engine(DATABASE_URL)

with engine.connect() as connection:
    result = connection.execute(text("SELECT 'MYSQL DB connected successfully.......'"))
    print(result.fetchone())





'''

Why with?

Instead of manually doing:

connection = engine.connect()

result = connection.execute(text("SELECT 1"))

connection.close()


we use:
with engine.connect() as connection:    
result = connection.execute(text("SELECT 1"))

The with statement automatically handles closing the connection.

-----------------------------------

text() comes from SQLAlchemy:

from sqlalchemy import text


It tells SQLAlchemy:
"This is a piece of SQL text that I want you to execute."


------------------------------------------
execute() sends the SQL to MySQL.

MySQL sends the result back.


------------------------------------

What is fetchone()?

result.fetchone()


means:
"Give me one row from the result."

Since:
SELECT 1;

returns:
1

we get:
(1,)

Why (1,) instead of just 1?
Because SQL query results are represented as rows, and a row is tuple-like.



''' 
