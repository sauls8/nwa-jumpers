# Inventory Import - Quick Reference

## 📋 Excel Columns (In Order)

1. **id** - Unique identifier (e.g., `princess-castle`)
2. **name** - Display name (e.g., `Princess Castle`)
3. **category** - One of: `castle`, `superhero`, `sports`, `toddler`
4. **price** - Number only (e.g., `150`)
5. **description** - Short description text
6. **dimensions** - Size (e.g., `15ft x 15ft x 12ft`)
7. **capacity** - Kids capacity (e.g., `8-10 kids`)
8. **image_url** - Full URL to image
9. **features** - Comma-separated list (e.g., `Feature 1, Feature 2, Feature 3`)

## 🚀 Quick Steps

1. Fill Excel with your data
2. Save as CSV → name it `inventory.csv`
3. Put CSV in `scripts/` folder
4. Run: `node scripts/convert-inventory.js`
5. Test: `cd frontend && npm run dev`
6. Deploy!

## 🖼️ Image Tips

- **Host online:** Google Drive (public), Imgur, or your website
- **Size:** 800x600px recommended
- **Format:** JPG or PNG
- **Test URLs:** Open in browser to verify they work

## ✅ Checklist

- [ ] All required columns filled
- [ ] IDs are unique and lowercase
- [ ] Prices are numbers (no $)
- [ ] Image URLs work (test in browser)
- [ ] Category IDs match existing categories
- [ ] CSV saved correctly

## 📞 Need Help?

See `INVENTORY_IMPORT_GUIDE.md` for detailed instructions.

