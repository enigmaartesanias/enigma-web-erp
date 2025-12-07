-- Habilitar Row Level Security (RLS) en las tablas
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalles_pedido ENABLE ROW LEVEL SECURITY;

-- Política para la tabla 'pedidos'
-- Permitir todo (SELECT, INSERT, UPDATE, DELETE) a usuarios autenticados
CREATE POLICY "Permitir todo a usuarios autenticados en pedidos"
ON pedidos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para la tabla 'detalles_pedido'
-- Permitir todo (SELECT, INSERT, UPDATE, DELETE) a usuarios autenticados
CREATE POLICY "Permitir todo a usuarios autenticados en detalles_pedido"
ON detalles_pedido
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- (Opcional) Si necesitas que usuarios anónimos (público) puedan LEER pero NO editar, podrías agregar:
-- CREATE POLICY "Lectura pública pedidos" ON pedidos FOR SELECT TO anon USING (true);
