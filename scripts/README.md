# Inventory Conversion Scripts

## Quick Start

1. **Prepare your Excel file:**
   - Use the template from `INVENTORY_IMPORT_GUIDE.md`
   - Fill in all your inflatables data
   - Save as CSV format

2. **Place CSV file here:**
   - Name it `inventory.csv`
   - Put it in this `scripts/` folder

3. **Run the conversion:**
   ```bash
   node scripts/convert-inventory.js
   ```

4. **Check the output:**
   - The script will update `frontend/src/data/inflatables.ts`
   - Review the file to make sure everything looks correct

5. **Test locally:**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Deploy!**

## File Structure

```
scripts/
├── README.md (this file)
├── convert-inventory.js (conversion script)
└── inventory.csv (your Excel file saved as CSV - you create this)
```

## Troubleshooting

**Error: "inventory.csv not found"**
- Make sure you saved your Excel file as CSV
- Make sure it's named exactly `inventory.csv`
- Make sure it's in the `scripts/` folder

**Images not showing:**
- Check that image URLs are accessible
- Test URLs in a browser first
- Make sure URLs are full paths (include `http://` or `https://`)

**Missing data:**
- Check your CSV has all required columns
- Make sure there are no empty rows
- Verify category IDs match existing categories

