# Inventory Import Guide - NWA Jumpers

This guide will help you import your real inventory data from Excel into the booking system.

## 📊 Excel Template Structure

Create an Excel file with the following columns:

| Column Name | Description | Example | Required |
|------------|-------------|---------|----------|
| **id** | Unique identifier (lowercase, hyphens) | `princess-castle` | ✅ Yes |
| **name** | Display name | `Princess Castle` | ✅ Yes |
| **category** | Category ID (must match existing) | `castle`, `superhero`, `sports`, `toddler` | ✅ Yes |
| **price** | Rental price (number only) | `150` | ✅ Yes |
| **description** | Short description | `A magical pink castle perfect for your little princess's royal party!` | ✅ Yes |
| **dimensions** | Size dimensions | `15ft x 15ft x 12ft` | ✅ Yes |
| **capacity** | Number of kids | `8-10 kids` | ✅ Yes |
| **image_url** | Full URL to image | `https://yourdomain.com/images/princess-castle.jpg` | ✅ Yes |
| **features** | Comma-separated features | `Pink & Purple Design, Safe Entry/Exit, Easy Setup` | ⚠️ Optional |

### Category IDs (use exactly these):
- `castle` - Castle adventures
- `superhero` - Superhero themed
- `sports` - Sports themed
- `toddler` - Toddler safe
- Or create new ones (see below)

## 📝 Step-by-Step Process

### Step 1: Prepare Your Excel File

1. Open Excel/Google Sheets
2. Create columns matching the template above
3. Fill in your inventory data
4. Save as CSV (File → Save As → CSV format)

**Example Row:**
```
id,name,category,price,description,dimensions,capacity,image_url,features
princess-castle,Princess Castle,castle,150,A magical pink castle perfect for your little princess's royal party!,15ft x 15ft x 12ft,8-10 kids,https://yourdomain.com/images/princess-castle.jpg,"Pink & Purple Design, Safe Entry/Exit, Easy Setup, Weather Resistant"
```

### Step 2: Prepare Images

**Option A: Host Images Online (Recommended)**
- Upload images to:
  - Google Drive (make public, get shareable link)
  - Imgur
  - Your website/CDN
  - Cloud storage (AWS S3, Cloudinary)
- Use full URL in `image_url` column

**Option B: Use Local Images (For Development)**
- Place images in `frontend/public/images/`
- Use path like `/images/princess-castle.jpg`
- Note: These won't work in production unless you deploy them

### Step 3: Convert CSV to TypeScript

I'll create a conversion script for you (see `scripts/convert-inventory.js` below).

### Step 4: Update the Data File

Replace the contents of `frontend/src/data/inflatables.ts` with your converted data.

## 🖼️ Image Requirements

- **Format:** JPG or PNG
- **Recommended Size:** 800x600px or 1200x900px
- **File Size:** Under 500KB per image (for fast loading)
- **Naming:** Use the same as your `id` field (e.g., `princess-castle.jpg`)

## 📋 Adding New Categories

If you have categories not in the current list:

1. **Update Categories Page** (`frontend/src/components/CategoriesPage.tsx`):
   ```typescript
   {
     id: 'your-category-id',
     name: 'Your Category Name',
     icon: '🎨', // Choose an emoji
     description: 'Description of this category',
     color: '#8B5CF6' // Hex color code
   }
   ```

2. **Update Category Titles** (`frontend/src/components/InflatablesPage.tsx`):
   Add to the `getCategoryTitle` and `getCategoryDescription` functions.

## 🔄 Quick Import Process

1. Fill out Excel with your inventory
2. Save as CSV
3. Run the conversion script (I'll provide this)
4. Copy output into `inflatables.ts`
5. Test locally
6. Deploy!

## ✅ Checklist Before Import

- [ ] All required columns filled
- [ ] IDs are unique and lowercase with hyphens
- [ ] Category IDs match existing categories (or you've added new ones)
- [ ] Prices are numbers only (no $ sign)
- [ ] Image URLs are accessible (test in browser)
- [ ] Features are comma-separated
- [ ] CSV file is saved correctly

## 🚨 Common Issues

**Problem:** Images not showing
- **Solution:** Check image URLs are accessible. Test URL in browser first.

**Problem:** Category not showing
- **Solution:** Make sure category ID exactly matches (case-sensitive, no spaces).

**Problem:** Price showing as $0
- **Solution:** Make sure price column has numbers only, no currency symbols.

## 📞 Need Help?

Once you have your Excel file ready, I can help you:
1. Convert it to the right format
2. Set up image hosting
3. Test the import
4. Add any new categories you need

