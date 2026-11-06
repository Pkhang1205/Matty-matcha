import pyodbc

def get_connection():
    conn = pyodbc.connect(
        "DRIVER={ODBC Driver 18 for SQL Server};"
        "SERVER=localhost,1433;"
        "DATABASE=MattyMatcha;"
        "UID=sa;"
        "PWD=@Pkhang1205;"
        "Encrypt=yes;"
        "TrustServerCertificate=yes;"
    )

    return conn
