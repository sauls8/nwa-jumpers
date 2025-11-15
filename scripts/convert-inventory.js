/**
 * Inventory CSV to TypeScript Converter
 * 
 * Usage:
 * 1. Save your Excel file as CSV
 * 2. Place CSV file in this directory as "inventory.csv"
 * 3. Run: node scripts/convert-inventory.js
 * 4. Copy the output into frontend/src/data/inflatables.ts
 */

const fs = require('fs');
const path = require('path');

// Read CSV file
const csvPath = path.join(__dirname, 'inventory.csv');

if (!fs.existsSync(csvPath)) {
  console.error('❌ Error: inventory.csv not found!');
  console.log('📝 Please:');
  console.log('   1. Save your Excel file as CSV');
  console.log('   2. Name it "inventory.csv"');
  console.log('   3. Place it in the scripts/ folder');
  process.exit(1);
}

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Parse header
const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

// Helper to parse CSV values (handles commas in quoted strings)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Parse data rows
const inflatables = [];

for (let i = 1; i < lines.length; i++) {
  const values = parseCSVLine(lines[i]);
  
  if (values.length < headers.length) {
    console.warn(`⚠️  Skipping row ${i + 1}: Not enough columns`);
    continue;
  }
  
  const inflatable = {};
  
  headers.forEach((header, index) => {
    let value = values[index] || '';
    value = value.replace(/^"|"$/g, '').trim(); // Remove quotes
    
    // Convert price to number
    if (header === 'price') {
      value = parseFloat(value) || 0;
    }
    
    // Parse features array
    if (header === 'features' && value) {
      value = value.split(',').map(f => f.trim()).filter(f => f);
    }
    
    inflatable[header] = value;
  });
  
  // Generate ID from name if not provided
  if (!inflatable.id && inflatable.name) {
    inflatable.id = inflatable.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Validate required fields
  if (!inflatable.id || !inflatable.name || !inflatable.category || !inflatable.price) {
    console.warn(`⚠️  Skipping row ${i + 1}: Missing required fields`);
    continue;
  }
  
  // Ensure features is an array
  if (!Array.isArray(inflatable.features)) {
    inflatable.features = inflatable.features ? [inflatable.features] : [];
  }
  
  inflatables.push(inflatable);
}

// Generate TypeScript output
const tsOutput = `export interface Inflatable {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  features: string[];
  dimensions: string;
  capacity: string;
}

export const inflatablesData: Inflatable[] = [
${inflatables.map((item, index) => {
  const isLast = index === inflatables.length - 1;
  const featuresArray = Array.isArray(item.features) 
    ? item.features 
    : (item.features ? [item.features] : []);
  
  const featuresString = featuresArray.length > 0
    ? `[${featuresArray.map(f => `'${f.replace(/'/g, "\\'")}'`).join(', ')}]`
    : '[]';
  
  return `  {
    id: '${item.id}',
    name: '${item.name.replace(/'/g, "\\'")}',
    description: '${(item.description || '').replace(/'/g, "\\'")}',
    image: '${item.image_url || item.image || ''}',
    price: ${item.price || 0},
    category: '${item.category}',
    features: ${featuresString},
    dimensions: '${item.dimensions || ''}',
    capacity: '${item.capacity || ''}'
  }${isLast ? '' : ','}`;
}).join('\n')}
];

export const getInflatablesByCategory = (categoryId: string): Inflatable[] => {
  return inflatablesData.filter(inflatable => inflatable.category === categoryId);
};

export const getInflatableById = (id: string): Inflatable | undefined => {
  return inflatablesData.find(inflatable => inflatable.id === id);
};
`;

// Write output
const outputPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'inflatables.ts');
fs.writeFileSync(outputPath, tsOutput, 'utf-8');

console.log('✅ Successfully converted inventory!');
console.log(`📁 Output written to: ${outputPath}`);
console.log(`📊 Converted ${inflatables.length} inflatables`);
console.log('\n📝 Next steps:');
console.log('   1. Review the generated file');
console.log('   2. Test locally: npm run dev');
console.log('   3. If everything looks good, deploy!');

