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
- **Database Connection Errors**: If services fail to connect, restart with `docker-compose restart`.
- **Frontend API Error**: Ensure backend is running on port `8000`.
