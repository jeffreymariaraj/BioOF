# BioOF MVP Walkthrough

This document guides you through running and testing the **BioOF (Optimization-Centric Database System)** MVP.

## System Overview
The project is a containerized hybrid database system featuring:
- **Frontend**: React + TailwindCSS (Dashboard)
- **Backend**: FastAPI (Query Engine)
- **Structured DB**: PostgreSQL (Users, Projects, Experiments - 3NF)
- **Unstructured DB**: MongoDB (Genomic Data - JSON Documents)

## Prerequisite
- Docker & Docker Compose installed.

## How to Run
1. Navigate to the project root:
   ```bash
   cd BioOF
   ```
2. Start the services:
   ```bash
   docker-compose up --build
   ```
   *Note: The first run will take a moment to build images and seed the database with 10,000+ records.*

3. Access the Dashboard:
   - Open your browser to **http://localhost:5173**

## Features to Verify

### 1. Hybrid Architecture & Seeding
- The `seeder` container runs automatically. Check logs to see:
  ```
  PostgreSQL Seeding Complete.
  Generating 10000 Genomic Records in MongoDB...
  MongoDB Seeding Complete.
  ```

### 2. The Dashboard (UI)
- You will see a "Control Panel" and a "Data Table".
- **Source Badges**: Notice the tags indicating where data comes from:
  - `[SQL]` for Project Metadata.
  - `[NoSQL]` for Genomic Data.

### 3. Hybrid Query Logic
- Enter a `Project ID` (e.g., `1` to `50`) and a `Score Threshold` (e.g., `80`).
- Click **"Run Hybrid Query"**.
- The backend performs:
  1. **SQL**: Fetches Project info and Experiment IDs.
  2. **NoSQL**: Uses Experiment IDs to find high-scoring genes in Mongo.
  3. **Join**: Merges the results.

## Troubleshooting
- **Frontend API Error**: Ensure backend is running on port `8000`.

### 4. Redis Caching
- Click on any row in the table to open the **Gene Detail Modal**.
- First click: Badge says "Fetched from MongoDB" (Cache Miss).
- Second click: Badge says "Served from Redis Cache" (Cache Hit).
- Verify the speed difference!

### 5. OLAP Analytics
- Switch to the **"OLAP Analytics"** tab.
- **SQL Analytics**: View the "Genes per Chromosome" bar chart (Complex Aggregation).
- **NoSQL Analytics**: View the "GC Content Distribution" area chart (Aggregation Pipeline).
- **Why?**: Demonstrates the system's ability to handle complex analytical workloads on both structured and unstructured data.

### 6. Vector Similarity Search ("Biologically Aware" Search)
- **Goal**: Find genes with similar properties (Expression, GC, Complexity) using Cosine Similarity.
- **Action**: Click the "Find Similar" button on any gene row.
- **Result**: A modal appears showing 5 recommended genes.
- **Tech**: Uses `pgvector` HNSW index on 3D vectors `[Expression, GC, Complexity]`.

### 7. Dynamic Schema Evolution (New)
1.  **Navigate to Evolution Lab**: Click the "Evolution Lab" tab (last tab, with pulse effect).
2.  **View Architecture**: Click the "Info" (i) icon in the top right header to see the "Hybrid Schema Evolution Architecture" modal.
3.  **Evolve Schema**:
    *   **New Attribute Name**: Enter `protein_stability`
    *   **Default Value**: Enter `Pending Analysis`
    *   Click "Evolve Schema Now".
    *   *Observation*: You should see a success toast: "Schema Successfully Evolved! Added 'protein_stability' to 10,000+ documents."
4.  **Verify Propagation**:
    *   Switch back to the **Hybrid Query** tab.
    *   Run a search (e.g., Project ID `1`).
    *   *Observation*: The table now has a new column **protein_stability** with the value `Pending Analysis` for every row.
5.  **Status Propagation Rule**:
    *   Go back to **Evolution Lab**.
    *   **New Attribute Name**: Enter `Status`
    *   **Default Value**: Enter `Draft`
    *   Click "Evolve Schema Now".
    *   *Observation*: Backend logic intercepts "Status" and sets it to "Validated" (as per business rule).
    *   Check **Hybrid Query** tab: New column **Status** shows `Validated` for all rows.

## Next Steps
- Implement "Data Enrichment Pipelines" to backfill real data for these new fields.
