import express from 'express';
import { database } from '../database';
import type { Inflatable } from '../models/inflatableSchema';

const router = express.Router();

// Helper function to run database statements
const runStatement = (query: string, params: unknown[] = []): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    database.instance.run(query, params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * Helper function to parse features string to array
 */
const parseFeatures = (features: unknown): string[] => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features === 'string') {
    try {
      // Try to parse as JSON array
      const parsed = JSON.parse(features);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // If not JSON, split by comma
      return features.split(',').map(f => f.trim()).filter(f => f);
    }
  }
  return [];
};

/**
 * Helper function to stringify features array
 */
const stringifyFeatures = (features: string[] | null | undefined): string | null => {
  if (!features || features.length === 0) return null;
  return JSON.stringify(features);
};

/**
 * Transform database row to Inflatable interface
 */
const transformInflatable = (row: any): Inflatable => {
  return {
    id: row.id,
    name: row.name,
    description: row.description || null,
    image: row.image || null,
    price: Number(row.price || 0),
    category: row.category,
    features: parseFeatures(row.features),
    dimensions: row.dimensions || null,
    capacity: row.capacity || null,
    is_active: row.is_active !== undefined ? Number(row.is_active) : 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

/**
 * Generate ID from name
 */
const generateId = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

// GET /api/inventory - Get all inflatables
router.get('/', async (req, res) => {
  try {
    const { active_only } = req.query;
    const query = active_only === 'true' 
      ? 'SELECT * FROM inflatables WHERE is_active = 1 ORDER BY category, name ASC'
      : 'SELECT * FROM inflatables ORDER BY category, name ASC';
    
    const rows = await new Promise<any[]>((resolve, reject) => {
      database.instance.all(query, [], (err, result) => {
        if (err) reject(err);
        else resolve(result as any[]);
      });
    });
    const inflatables = rows.map(transformInflatable);
    
    res.json(inflatables);
  } catch (error) {
    console.error('Error fetching inflatables:', error);
    res.status(500).json({ error: 'Failed to fetch inflatables' });
  }
});

// GET /api/inventory/category/:category - Get inflatables by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const rows = await new Promise<any[]>((resolve, reject) => {
      database.instance.all(
        'SELECT * FROM inflatables WHERE category = ? AND is_active = 1 ORDER BY name ASC',
        [category],
        (err, result) => {
          if (err) reject(err);
          else resolve(result as any[]);
        }
      );
    });
    
    const inflatables = rows.map(transformInflatable);
    res.json(inflatables);
  } catch (error) {
    console.error('Error fetching inflatables by category:', error);
    res.status(500).json({ error: 'Failed to fetch inflatables' });
  }
});

// GET /api/inventory/:id - Get single inflatable
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const row = await new Promise<any>((resolve, reject) => {
      database.instance.get(
        'SELECT * FROM inflatables WHERE id = ?',
        [id],
        (err, result) => {
          if (err) reject(err);
          else resolve(result as any);
        }
      );
    });
    
    if (!row) {
      return res.status(404).json({ error: 'Inflatable not found' });
    }
    
    res.json(transformInflatable(row));
  } catch (error) {
    console.error('Error fetching inflatable:', error);
    res.status(500).json({ error: 'Failed to fetch inflatable' });
  }
});

// POST /api/inventory - Create new inflatable
router.post('/', async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      image,
      price,
      category,
      features,
      dimensions,
      capacity,
      is_active = 1,
    } = req.body;

    // Validation
    if (!name || !category || price === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: name, category, and price are required',
      });
    }

    // Generate ID if not provided
    const inflatableId = id || generateId(name);

    // Check if ID already exists
    const existing = await new Promise<any>((resolve, reject) => {
      database.instance.get(
        'SELECT id FROM inflatables WHERE id = ?',
        [inflatableId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result as any);
        }
      );
    });

    if (existing) {
      return res.status(400).json({ error: 'Inflatable with this ID already exists' });
    }

    // Insert inflatable
    await runStatement(
      `INSERT INTO inflatables (
        id, name, description, image, price, category, 
        features, dimensions, capacity, is_active, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        inflatableId,
        name.trim(),
        description?.trim() || null,
        image?.trim() || null,
        Number(price),
        category.trim(),
        stringifyFeatures(features),
        dimensions?.trim() || null,
        capacity?.trim() || null,
        is_active ? 1 : 0,
      ]
    );

    // Fetch created inflatable
    const created = await new Promise<any>((resolve, reject) => {
      database.instance.get(
        'SELECT * FROM inflatables WHERE id = ?',
        [inflatableId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result as any);
        }
      );
    });

    res.status(201).json({
      success: true,
      message: 'Inflatable created successfully',
      inflatable: transformInflatable(created),
    });
  } catch (error) {
    console.error('Error creating inflatable:', error);
    res.status(500).json({ error: 'Failed to create inflatable' });
  }
});

// PUT /api/inventory/:id - Update inflatable
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      image,
      price,
      category,
      features,
      dimensions,
      capacity,
      is_active,
    } = req.body;

    // Check if inflatable exists
    const existing = await new Promise<any>((resolve, reject) => {
      database.instance.get(
        'SELECT id FROM inflatables WHERE id = ?',
        [id],
        (err, result) => {
          if (err) reject(err);
          else resolve(result as any);
        }
      );
    });

    if (!existing) {
      return res.status(404).json({ error: 'Inflatable not found' });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name.trim());
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description?.trim() || null);
    }
    if (image !== undefined) {
      updates.push('image = ?');
      values.push(image?.trim() || null);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(Number(price));
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category.trim());
    }
    if (features !== undefined) {
      updates.push('features = ?');
      values.push(stringifyFeatures(features));
    }
    if (dimensions !== undefined) {
      updates.push('dimensions = ?');
      values.push(dimensions?.trim() || null);
    }
    if (capacity !== undefined) {
      updates.push('capacity = ?');
      values.push(capacity?.trim() || null);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Always update updated_at
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await runStatement(
      `UPDATE inflatables SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated inflatable
    const updated = await new Promise<any>((resolve, reject) => {
      database.instance.get(
        'SELECT * FROM inflatables WHERE id = ?',
        [id],
        (err, result) => {
          if (err) reject(err);
          else resolve(result as any);
        }
      );
    });

    res.json({
      success: true,
      message: 'Inflatable updated successfully',
      inflatable: transformInflatable(updated),
    });
  } catch (error) {
    console.error('Error updating inflatable:', error);
    res.status(500).json({ error: 'Failed to update inflatable' });
  }
});

// DELETE /api/inventory/:id - Soft delete inflatable
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if inflatable exists
    const existing = await new Promise<any>((resolve, reject) => {
      database.instance.get(
        'SELECT id FROM inflatables WHERE id = ?',
        [id],
        (err, result) => {
          if (err) reject(err);
          else resolve(result as any);
        }
      );
    });

    if (!existing) {
      return res.status(404).json({ error: 'Inflatable not found' });
    }

    // Soft delete (set is_active to 0)
    await runStatement(
      'UPDATE inflatables SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Inflatable deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting inflatable:', error);
    res.status(500).json({ error: 'Failed to delete inflatable' });
  }
});

// POST /api/inventory/bulk - Bulk create inflatables
router.post('/bulk', async (req, res) => {
  try {
    const { inflatables } = req.body;

    if (!Array.isArray(inflatables) || inflatables.length === 0) {
      return res.status(400).json({ error: 'Invalid inflatables array' });
    }

    const results = [];
    const errors = [];

    for (const item of inflatables) {
      try {
        const {
          id,
          name,
          description,
          image,
          price,
          category,
          features,
          dimensions,
          capacity,
        } = item;

        if (!name || !category || price === undefined) {
          errors.push({ item, error: 'Missing required fields' });
          continue;
        }

        const inflatableId = id || generateId(name);

        // Check if exists
        const existing = await new Promise<any>((resolve, reject) => {
          database.instance.get(
            'SELECT id FROM inflatables WHERE id = ?',
            [inflatableId],
            (err, result) => {
              if (err) reject(err);
              else resolve(result as any);
            }
          );
        });

        if (existing) {
          errors.push({ item, error: 'ID already exists' });
          continue;
        }

        await runStatement(
          `INSERT INTO inflatables (
            id, name, description, image, price, category, 
            features, dimensions, capacity, is_active, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
          [
            inflatableId,
            name.trim(),
            description?.trim() || null,
            image?.trim() || null,
            Number(price),
            category.trim(),
            stringifyFeatures(features),
            dimensions?.trim() || null,
            capacity?.trim() || null,
          ]
        );

        results.push({ id: inflatableId, name, success: true });
      } catch (error) {
        errors.push({ item, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${results.length} inflatables`,
      created: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error bulk creating inflatables:', error);
    res.status(500).json({ error: 'Failed to bulk create inflatables' });
  }
});

export default router;

