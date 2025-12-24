-- Ver estructura completa de la tabla compras
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'compras'
ORDER BY ordinal_position;
