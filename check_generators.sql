-- Query to check active generators in the database
SELECT 
  id,
  name,
  region,
  status,
  discount,
  capacity
FROM generators
WHERE status = 'active'
ORDER BY discount DESC;

-- Query to check all generators (including inactive)
SELECT 
  id,
  name,
  region,
  status,
  discount
FROM generators
ORDER BY status, discount DESC;
