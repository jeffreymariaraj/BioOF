# BioOF: Optimization-Centric Database System (MVP)

BioOF is a hybrid database management system designed for genomic research. It demonstrates a **Polyglot Persistence** architecture, combining the strengths of relational and document-oriented databases.

## 🚀 Quick Start

1. **Clone the repository** (or navigate to the `BioOF` folder).
2. **Launch the system**:
   ```bash
   docker-compose up --build
   ```
3. **Access the Dashboard**:
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗️ Technical Architecture

- **Frontend**: React (Vite) + TailwindCSS.
- **Backend Query Engine**: FastAPI (Python).
- **Relational Layer (SQL)**: PostgreSQL (Stores structured metadata: Users, Projects, Experiments).
- **Document Layer (NoSQL)**: MongoDB (Stores unstructured genomic data: Sequences, expression scores).
- **Containerization**: Docker & Docker Compose.

## 🧪 Hybrid Join Logic
The system implements a manual join in the backend:
1. Validates structured metadata in PostgreSQL.
2. Filters high-volume genomic data in MongoDB based on foreign keys and scores.
3. Merges the results in memory to provide a unified JSON response.

## 📊 Data Seeding
Upon startup, the `seeder` service automatically populates:
- **10,000+** Genomic records in MongoDB.
- Associated metadata in PostgreSQL (3NF compliant).
