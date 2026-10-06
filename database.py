from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "mysql+pymysql://root:aniadmin@localhost:3306/apidata"


engine=create_engine(DATABASE_URL)


session = sessionmaker(autocommit=False, autoflush=False, bind=engine)