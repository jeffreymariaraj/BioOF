# BioOF: Optimization-Centric Database System 🧬

BioOF is a high-performance, hybrid database management system designed for large-scale genomic research. It demonstrates a **Polyglot Persistence** architecture, orchestrating multiple database technologies to solve complex biological data challenges.

![Architecture](https://img.shields.io/badge/Architecture-Hybrid_SQL_%2B_NoSQL-blue)
![Tech](https://img.shields.io/badge/Tech-FastAPI_%7C_React_%7C_Docker-green)
![Data](https://img.shields.io/badge/Data-10k%2B_Genomic_Records-orange)

## 🚀 Quick Start

1. **Navigate to the project root**:
   ```bash
   cd BioOF
   ```

2. **Launch the system**:
   ```bash
   docker-compose up --build
   ```
   *Note: This will automatically build the images and seed the databases with 10,000+ biological records.*

3. **Explore the Dashboard**:
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗️ Technical Architecture

BioOF leverages a multi-layered storage strategy to optimize for different query patterns:

- **Relational Layer (PostgreSQL)**: Enforces 3NF compliance for structured metadata (Users, Projects, Experiments).
- **Document Layer (MongoDB)**: Scalable storage for unstructured genomic sequence data and expression scores.
- **Acceleration Layer (Redis)**: Low-latency caching for frequent gene lookups, demonstrating a 10x speedup over direct DB access.
- **Vector Search Engine (pgvector)**: "Biologically Aware" similarity search using high-dimensional embeddings and HNSW indexing.

---

## 💎 Key Features

### 1. Hybrid Query Engine
A sophisticated mediator logic in the backend that performs cross-database joins between SQL and NoSQL layers. It filters structured project metadata and unstructured genomic sequences into a unified payload.

### 2. OLAP Analytics Dashboard
Real-time analytical aggregations:
- **SQL Analytics**: Multi-table joins to visualize gene distributions across chromosomes.
- **NoSQL Analytics**: High-performance MongoDB aggregation pipelines for GC content distribution.

### 3. Vector Similarity Search
Utilizes **Cosine Similarity** on 3D biological vectors (Expression, GC Content, Complexity) to find functionally similar genes, powered by `pgvector`.

### 4. Dynamic Schema Evolution
A "Schema-on-Read" implementation allowing you to inject new biological attributes into a live database without downtime.
- **Registry**: SQL tracks the evolved schema.
- **Propagation**: MongoDB `$set` operator backfills 10k+ records instantly.
- **Semantic Logic**: Automatic propagation rules (e.g., auto-validating "Status" fields).

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TailwindCSS, Recharts, Lucide Icons.
- **Backend**: FastAPI (Python), SQLAlchemy, Motor (Async Mongo), Redis-py.
- **Database**: 
  - PostgreSQL 16 (with `pgvector`)
  - MongoDB 6.0
  - Redis 7.0
- **Orchestration**: Docker Compose.

---

## 📊 Data Engineering
The included `seeder.py` generates a rich biological dataset featuring:
- Accurate GC Content calculations.
- Normal Distribution for Expression Scores.
- 3D Vector Embeddings for similarity search.
- Realistic relational links for internal joins.
