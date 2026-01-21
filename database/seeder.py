import os
import time
import random
import psycopg2
from pymongo import MongoClient
from faker import Faker
import numpy as np

# Configuration
PG_URL = os.getenv("DATABASE_URL", "postgresql://biouser:biopassword@localhost:5432/bioof_db")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongoadmin:mongopassword@localhost:27017")
NUM_USERS = 50
NUM_PROJECTS = 100
NUM_EXPERIMENTS = 200
NUM_GENE_RECORDS = 10000

fake = Faker()

def get_pg_connection():
    retries = 5
    while retries > 0:
        try:
            conn = psycopg2.connect(PG_URL)
            return conn
        except psycopg2.OperationalError:
            print("Waiting for PostgreSQL...")
            time.sleep(2)
            retries -= 1
    raise Exception("Could not connect to PostgreSQL")

def get_mongo_connection():
    retries = 5
    client = MongoClient(MONGO_URI)
    while retries > 0:
        try:
            client.admin.command('ping')
            return client
        except Exception:
            print("Waiting for MongoDB...")
            time.sleep(2)
            retries -= 1
    raise Exception("Could not connect to MongoDB")

def seed_data():
    print("Starting Data Seeding...")
    
    # Connect to DBs
    pg_conn = get_pg_connection()
    pg_cursor = pg_conn.cursor()
    
    mongo_client = get_mongo_connection()
    mongo_db = mongo_client["bioof_nosql"]
    gene_collection = mongo_db["gene_data"]

    # Check if data exists
    pg_cursor.execute("SELECT COUNT(*) FROM users;")
    user_count = pg_cursor.fetchone()[0]
    
    if user_count > 0:
        print("Data already exists. Skipping seeding.")
        return

    print(f"Generating {NUM_USERS} Users...")
    users = []
    for _ in range(NUM_USERS):
        username = fake.user_name()
        email = fake.unique.email()
        pg_cursor.execute(
            "INSERT INTO users (username, email) VALUES (%s, %s) RETURNING id;",
            (username, email)
        )
        users.append(pg_cursor.fetchone()[0])

    print(f"Generating {NUM_PROJECTS} Projects...")
    projects = []
    for _ in range(NUM_PROJECTS):
        owner_id = random.choice(users)
        name = fake.bs()
        desc = fake.catch_phrase()
        pg_cursor.execute(
            "INSERT INTO projects (name, description, owner_id) VALUES (%s, %s, %s) RETURNING id;",
            (name, desc, owner_id)
        )
        projects.append(pg_cursor.fetchone()[0])

    print(f"Generating {NUM_EXPERIMENTS} Experiments...")
    experiments = []
    for _ in range(NUM_EXPERIMENTS):
        project_id = random.choice(projects)
        name = f"Exp-{fake.uuid4()[:8]}"
        desc = fake.text()
        pg_cursor.execute(
            "INSERT INTO experiments (project_id, name, description) VALUES (%s, %s, %s) RETURNING id;",
            (project_id, name, desc)
        )
        experiments.append(pg_cursor.fetchone()[0])

    pg_conn.commit()
    print("PostgreSQL Seeding Complete.")

    print(f"Generating {NUM_GENE_RECORDS} Genomic Records in MongoDB & SQL Metadata...")
    gene_docs = []
    
    # Generate realistic-looking data using numpy for scores
    # Varied distributions for analytics demo
    scores = np.concatenate([
        np.random.normal(loc=30, scale=10, size=int(NUM_GENE_RECORDS * 0.3)),
        np.random.normal(loc=70, scale=15, size=int(NUM_GENE_RECORDS * 0.7))
    ])
    np.random.shuffle(scores)
    
    gc_contents = np.random.uniform(20, 80, size=NUM_GENE_RECORDS)
    
    # Batch SQL inserts for performance
    sql_gene_buffer = []

    for i in range(NUM_GENE_RECORDS):
        experiment_id = random.choice(experiments)
        gene_symbol = f"GENE-{random.randint(1000, 9999)}"
        sequence_len = random.randint(100, 2000)
        sequence = "".join(random.choices("ACGT", k=50)) # Short snippet
        chrom = f"chr{random.randint(1, 23)}"
        if random.random() < 0.05: chrom = "chrX"
        if random.random() < 0.05: chrom = "chrY"
        
        # 1. Prepare Mongo Document
        doc = {
            "experiment_id": experiment_id,
            "gene_symbol": gene_symbol,
            "sequence_snippet": sequence,
            "expression_score": float(scores[i]),
            "gc_content": float(gc_contents[i]),
            "metadata": {
                "biotype": random.choice(["protein_coding", "lncRNA", "miRNA", "pseudogene"]),
                "chromosome": chrom
            },
            "timestamp": fake.iso8601()
        }
        gene_docs.append(doc)

        # 2. Prepare SQL Metadata Tuple
        sql_gene_buffer.append((gene_symbol, experiment_id, chrom, sequence_len))

    # Bulk Insert Mongo
    gene_collection.insert_many(gene_docs)
    
    # Bulk Insert SQL
    print("Populating SQL 'gene_metadata' table...")
    args_str = ','.join(pg_cursor.mogrify("(%s,%s,%s,%s)", x).decode('utf-8') for x in sql_gene_buffer)
    pg_cursor.execute("INSERT INTO gene_metadata (gene_symbol, experiment_id, chromosome, sequence_length) VALUES " + args_str) 

    pg_conn.commit()
    
    # Create index for query performance
    gene_collection.create_index([("expression_score", -1)])
    gene_collection.create_index("experiment_id")
    
    print("MongoDB Seeding Complete.")
    print("Seeding Finished Successfully!")

    pg_cursor.close()
    pg_conn.close()
    mongo_client.close()

if __name__ == "__main__":
    seed_data()
