-- ZakatTrack Database Schema (PostgreSQL + PostGIS)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Table for Mustahik (Penerima Zakat)
CREATE TABLE IF NOT EXISTS mustahiks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    nik VARCHAR(20) UNIQUE,
    address TEXT,
    location GEOMETRY(Point, 4326), -- PostGIS point
    income NUMERIC(15, 2) DEFAULT 0,
    dependents INTEGER DEFAULT 0,
    assets NUMERIC(15, 2) DEFAULT 0,
    house_status INTEGER DEFAULT 2, -- 1: Sewa, 2: Milik
    utility_exp NUMERIC(15, 2) DEFAULT 0,
    health_status INTEGER DEFAULT 1, -- 1: Sehat, 2: Sakit
    asnaf_category VARCHAR(50),      -- Classified by Naive Bayes
    priority_score NUMERIC(5, 4),    -- Calculated by SAW
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Donations
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    muzakki_name VARCHAR(255),
    amount NUMERIC(15, 2) NOT NULL,
    mustahik_id UUID REFERENCES mustahiks(id),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    qr_code_hash TEXT UNIQUE,
    status VARCHAR(50) DEFAULT 'success'
);

-- Index for spatial queries
CREATE INDEX IF NOT EXISTS mustahiks_location_idx ON mustahiks USING GIST (location);
