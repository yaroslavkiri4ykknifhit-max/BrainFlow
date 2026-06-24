-- Supabase SQL Schema Patch for BrainFlow Roadmap
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Add parent_id self-referencing foreign key to items
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES items(id) ON DELETE SET NULL;

-- 2. Add tier integer column for grouping goals into progression levels
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS tier INTEGER DEFAULT 1;

-- 3. Add indices for optimal performance during tree querying
CREATE INDEX IF NOT EXISTS idx_items_parent_id ON items(parent_id);
CREATE INDEX IF NOT EXISTS idx_items_tier ON items(tier);
