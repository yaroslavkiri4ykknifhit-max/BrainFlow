-- Supabase SQL Schema Patch for BrainFlow Roadmap Mindmap
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Add parent_id self-referencing foreign key to items
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES items(id) ON DELETE SET NULL;

-- 2. Add tier integer column for grouping goals into progression levels
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS tier INTEGER DEFAULT 1;

-- 3. Add position coordinates for customizable mindmap layout
ALTER TABLE items
ADD COLUMN IF NOT EXISTS position_x INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS position_y INTEGER DEFAULT 100;

-- 4. Add locked column for manual override of lock states
ALTER TABLE items
ADD COLUMN IF NOT EXISTS locked BOOLEAN DEFAULT FALSE;

-- 5. Add indices for optimal performance during tree querying
CREATE INDEX IF NOT EXISTS idx_items_parent_id ON items(parent_id);
CREATE INDEX IF NOT EXISTS idx_items_tier ON items(tier);
