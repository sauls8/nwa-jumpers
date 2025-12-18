# SQLite Database Query Guide

## Quick Access

Your database is located at: `node-api/bookings.db`

## Basic Commands

### 1. Open the Database
```bash
cd node-api
sqlite3 bookings.db
```

### 2. View All Tables
```sql
.tables
```

### 3. View Table Schema
```sql
.schema bookings
.schema booking_items
```

### 4. Exit SQLite
```sql
.quit
```

## Useful Queries

### View All Bookings
```sql
SELECT * FROM bookings;
```

### View Bookings with Formatted Output
```sql
.mode column
.headers on
SELECT id, customer_name, customer_email, event_date, total_amount 
FROM bookings 
ORDER BY event_date DESC;
```

### View Bookings for a Specific Date
```sql
SELECT * FROM bookings WHERE event_date = '2024-01-15';
```

### View Booking Items
```sql
SELECT * FROM booking_items;
```

### View Booking with Items (JOIN)
```sql
SELECT 
    b.id,
    b.customer_name,
    b.event_date,
    bi.product_name,
    bi.quantity,
    bi.unit_price,
    bi.total_price
FROM bookings b
LEFT JOIN booking_items bi ON b.id = bi.booking_id
ORDER BY b.id, bi.id;
```

### Count Bookings by Date
```sql
SELECT event_date, COUNT(*) as booking_count
FROM bookings
GROUP BY event_date
ORDER BY event_date DESC;
```

### View Recent Bookings
```sql
SELECT * FROM bookings 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Available Dates (dates with no bookings)
```sql
-- This would require a date range, but you can check specific dates:
SELECT '2024-01-20' as date,
       CASE WHEN COUNT(*) = 0 THEN 'Available' ELSE 'Booked' END as status
FROM bookings
WHERE event_date = '2024-01-20';
```

### View Bookings with Total Item Count
```sql
SELECT 
    b.id,
    b.customer_name,
    b.event_date,
    COUNT(bi.id) as item_count,
    b.total_amount
FROM bookings b
LEFT JOIN booking_items bi ON b.id = bi.booking_id
GROUP BY b.id
ORDER BY b.event_date DESC;
```

### View Pricing Summary
```sql
SELECT 
    event_date,
    COUNT(*) as bookings,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_booking_value
FROM bookings
GROUP BY event_date
ORDER BY event_date DESC;
```

### Search by Customer Name
```sql
SELECT * FROM bookings 
WHERE customer_name LIKE '%Smith%';
```

### Search by Email
```sql
SELECT * FROM bookings 
WHERE customer_email = 'customer@example.com';
```

## Output Formatting

### Set Column Mode (easier to read)
```sql
.mode column
.headers on
.width 5 20 15 12 10
```

### Export to CSV
```sql
.mode csv
.headers on
.output bookings_export.csv
SELECT * FROM bookings;
.output stdout
```

### Export to JSON (if sqlite3 supports it)
```sql
.mode json
SELECT * FROM bookings LIMIT 5;
```

## One-Line Commands (Without Opening SQLite)

### Quick Query from Terminal
```bash
sqlite3 node-api/bookings.db "SELECT * FROM bookings;"
```

### Formatted Output
```bash
sqlite3 -header -column node-api/bookings.db "SELECT id, customer_name, event_date FROM bookings LIMIT 5;"
```

### Count Records
```bash
sqlite3 node-api/bookings.db "SELECT COUNT(*) FROM bookings;"
```

### View Schema
```bash
sqlite3 node-api/bookings.db ".schema"
```

## Advanced Queries

### Find Bookings with Multiple Items
```sql
SELECT 
    b.id,
    b.customer_name,
    COUNT(bi.id) as item_count
FROM bookings b
JOIN booking_items bi ON b.id = bi.booking_id
GROUP BY b.id
HAVING COUNT(bi.id) > 1;
```

### Calculate Revenue by Month
```sql
SELECT 
    strftime('%Y-%m', event_date) as month,
    COUNT(*) as bookings,
    SUM(total_amount) as revenue
FROM bookings
WHERE event_date IS NOT NULL
GROUP BY month
ORDER BY month DESC;
```

### Find Most Popular Products
```sql
SELECT 
    product_name,
    COUNT(*) as times_rented,
    SUM(quantity) as total_quantity
FROM booking_items
GROUP BY product_name
ORDER BY times_rented DESC;
```

## Troubleshooting

### If sqlite3 is not installed:

**macOS:**
```bash
brew install sqlite3
```

**Linux:**
```bash
sudo apt-get install sqlite3
```

**Check if installed:**
```bash
sqlite3 --version
```

## Tips

1. **Use `.mode column`** for better readability
2. **Use `.headers on`** to see column names
3. **Use `.width`** to set column widths for better formatting
4. **Use `.timer on`** to see query execution time
5. **Use `.explain`** to see query execution plan

## Example Session

```bash
$ cd node-api
$ sqlite3 bookings.db

sqlite> .mode column
sqlite> .headers on
sqlite> SELECT id, customer_name, event_date, total_amount FROM bookings LIMIT 5;
id          customer_name    event_date    total_amount
----------  ---------------  ------------  ------------
1           John Doe         2024-01-15    550.00
2           Jane Smith       2024-01-20    825.00

sqlite> .quit
```




