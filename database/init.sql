-- BioOF MVP Database Schema
-- Hybrid Database Architecture Demo
-- Enforcing 3NF for Structured Metadata

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'researcher',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Vector Extension for Similarity Search
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS experiments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    date_conducted DATE DEFAULT CURRENT_DATE,
    description TEXT,
    -- Provides a link to the MongoDB collection/tags if needed, 
    -- primarily we link logically via experiment_id in NoSQL.
    nosql_collection_ref VARCHAR(50) DEFAULT 'gene_data' 
);

-- For OLAP Analytics Upgrade (SQL Aggregation Demo)
-- Stores a subset of gene features (e.g., from an upstream ETL process)
-- Intentionally duplicated/structured to allow efficient GROUP BY queries.
CREATE TABLE IF NOT EXISTS gene_metadata (
    id SERIAL PRIMARY KEY,
    gene_symbol VARCHAR(50) NOT NULL,
    experiment_id INTEGER REFERENCES experiments(id) ON DELETE CASCADE,
    chromosome VARCHAR(10) NOT NULL,
    sequence_length INTEGER NOT NULL,
    -- 3-Dimensional Vector: [Expression Score, GC Content, Complexity Factor]
    embedding vector(3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_experiments_project ON experiments(project_id);

-- High-dimensional index for optimized similarity search (HNSW)
-- Uses Cosine Distance (vector_cosine_ops)
CREATE INDEX idx_gene_embedding ON gene_metadata USING hnsw (embedding vector_cosine_ops);
