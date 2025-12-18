/**
 * Seed Inflatables Script
 * Populates the inflatables table with initial data from the static file
 * 
 * Run with: npx ts-node src/scripts/seedInflatables.ts
 */

import { database } from '../database';
import { initializeDatabase } from '../database';

// Import the static inflatables data
const inflatablesData = [
  // Castle Category
  {
    id: 'princess-castle',
    name: 'Princess Castle',
    description: 'A magical pink castle perfect for your little princess\'s royal party!',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    price: 150,
    category: 'castle',
    features: ['Pink & Purple Design', 'Safe Entry/Exit', 'Easy Setup', 'Weather Resistant'],
    dimensions: '15ft x 15ft x 12ft',
    capacity: '8-10 kids'
  },
  {
    id: 'medieval-castle',
    name: 'Medieval Castle',
    description: 'A grand castle fit for knights and dragons! Perfect for adventurous kids.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    price: 175,
    category: 'castle',
    features: ['Medieval Theme', 'Multiple Levels', 'Safe Netting', 'Durable Material'],
    dimensions: '18ft x 18ft x 15ft',
    capacity: '10-12 kids'
  },
  {
    id: 'fairy-tale-castle',
    name: 'Fairy Tale Castle',
    description: 'A whimsical castle with towers and slides for endless fun!',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    price: 200,
    category: 'castle',
    features: ['Fairy Tale Design', 'Built-in Slide', 'Multiple Entries', 'Premium Quality'],
    dimensions: '20ft x 20ft x 16ft',
    capacity: '12-15 kids'
  },
  // Superhero Category
  {
    id: 'superhero-training',
    name: 'Superhero Training Ground',
    description: 'Train like a superhero with this action-packed obstacle course!',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    price: 180,
    category: 'superhero',
    features: ['Obstacle Course', 'Superhero Theme', 'Multiple Challenges', 'Safe Materials'],
    dimensions: '16ft x 20ft x 14ft',
    capacity: '8-12 kids'
  },
  {
    id: 'batman-bounce',
    name: 'Batman Bounce House',
    description: 'Join the Dark Knight in this Batman-themed bounce house!',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    price: 160,
    category: 'superhero',
    features: ['Batman Design', 'High Bounce', 'Safe Netting', 'Easy Setup'],
    dimensions: '15ft x 15ft x 12ft',
    capacity: '8-10 kids'
  },
  {
    id: 'spiderman-web',
    name: 'Spider-Man Web Crawler',
    description: 'Climb and bounce like Spider-Man in this web-themed inflatable!',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    price: 170,
    category: 'superhero',
    features: ['Spider-Man Theme', 'Web Design', 'Climbing Elements', 'Durable Build'],
    dimensions: '14ft x 16ft x 13ft',
    capacity: '6-8 kids'
  },
  // Sports Category
  {
    id: 'sports-arena',
    name: 'Sports Arena',
    description: 'A multi-sport inflatable perfect for active kids and sports enthusiasts!',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    price: 190,
    category: 'sports',
    features: ['Multi-Sport Design', 'High Bounce', 'Team Colors', 'Weather Resistant'],
    dimensions: '18ft x 18ft x 15ft',
    capacity: '10-14 kids'
  },
  {
    id: 'football-field',
    name: 'Football Field Bounce',
    description: 'Score touchdowns in this football-themed bounce house!',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    price: 165,
    category: 'sports',
    features: ['Football Theme', 'Field Design', 'Safe Materials', 'Easy Setup'],
    dimensions: '16ft x 16ft x 12ft',
    capacity: '8-12 kids'
  },
  {
    id: 'basketball-court',
    name: 'Basketball Court Bounce',
    description: 'Shoot hoops and bounce in this basketball-themed inflatable!',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    price: 155,
    category: 'sports',
    features: ['Basketball Theme', 'Court Design', 'High Bounce', 'Durable Build'],
    dimensions: '15ft x 15ft x 11ft',
    capacity: '6-10 kids'
  },
  // Toddler Category
  {
    id: 'toddler-safe',
    name: 'Toddler Safe Zone',
    description: 'A specially designed bounce house for little ones with extra safety features!',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    price: 120,
    category: 'toddler',
    features: ['Extra Safe Design', 'Low Bounce', 'Soft Materials', 'Parent Friendly'],
    dimensions: '12ft x 12ft x 8ft',
    capacity: '4-6 toddlers'
  },
  {
    id: 'little-princess',
    name: 'Little Princess Palace',
    description: 'A gentle bounce house perfect for your little princess!',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    price: 130,
    category: 'toddler',
    features: ['Princess Theme', 'Gentle Bounce', 'Safe Entry', 'Easy Clean'],
    dimensions: '10ft x 10ft x 7ft',
    capacity: '3-5 toddlers'
  },
  {
    id: 'toddler-adventure',
    name: 'Toddler Adventure',
    description: 'A fun and safe adventure zone designed specifically for toddlers!',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    price: 125,
    category: 'toddler',
    features: ['Adventure Theme', 'Soft Landing', 'Easy Access', 'Toddler Safe'],
    dimensions: '11ft x 11ft x 8ft',
    capacity: '4-6 toddlers'
  }
];

const stringifyFeatures = (features: string[]): string | null => {
  if (!features || features.length === 0) return null;
  return JSON.stringify(features);
};

const seedInflatables = async () => {
  try {
    console.log('Initializing database...');
    await initializeDatabase();

    console.log('Checking existing inflatables...');
    const existing = await database.all('SELECT id FROM inflatables') as Array<{ id: string }>;
    const existingIds = new Set(existing.map(row => row.id));

    let created = 0;
    let skipped = 0;

    for (const inflatable of inflatablesData) {
      if (existingIds.has(inflatable.id)) {
        console.log(`⏭️  Skipping ${inflatable.name} (already exists)`);
        skipped++;
        continue;
      }

      await new Promise<void>((resolve, reject) => {
        database.instance.run(
          `INSERT INTO inflatables (
            id, name, description, image, price, category, 
            features, dimensions, capacity, is_active, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
          [
            inflatable.id,
            inflatable.name,
            inflatable.description,
            inflatable.image,
            inflatable.price,
            inflatable.category,
            stringifyFeatures(inflatable.features),
            inflatable.dimensions,
            inflatable.capacity,
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      console.log(`✅ Created ${inflatable.name}`);
      created++;
    }

    console.log('\n📊 Summary:');
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${inflatablesData.length}`);
    console.log('\n✨ Seeding complete!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding inflatables:', error);
    process.exit(1);
  }
};

// Run if executed directly
seedInflatables();

