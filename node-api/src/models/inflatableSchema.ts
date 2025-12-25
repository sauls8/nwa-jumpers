/**
 * Inflatable Schema Definition
 * Defines the structure of the inflatables table
 */

export const createInflatablesTableQuery = `
  CREATE TABLE IF NOT EXISTS inflatables (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    price REAL NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    features TEXT,
    dimensions TEXT,
    capacity TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

// Query to get all active inflatables
export const getActiveInflatablesQuery = `
  SELECT * FROM inflatables 
  WHERE is_active = 1
  ORDER BY category, name ASC
`;

// Query to get all inflatables (including inactive)
export const getAllInflatablesQuery = `
  SELECT * FROM inflatables 
  ORDER BY category, name ASC
`;

// Query to get inflatables by category
export const getInflatablesByCategoryQuery = `
  SELECT * FROM inflatables 
  WHERE category = ? AND is_active = 1
  ORDER BY name ASC
`;

// Query to get single inflatable by ID
export const getInflatableByIdQuery = `
  SELECT * FROM inflatables
  WHERE id = ?
`;

/**
 * TypeScript interface for type safety
 */
export interface Inflatable {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  price: number;
  category: string;
  features?: string[] | null;
  dimensions?: string | null;
  capacity?: string | null;
  is_active?: number | null;
  created_at?: string;
  updated_at?: string;
}



