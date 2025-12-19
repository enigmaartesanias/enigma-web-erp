-- ============================================================
-- SCRIPT: Actualizar Pedidos Antiguos a Estado "Entregado"
-- Fecha: 2025-12-19
-- Descripción: Marca como "entregado" todos los pedidos que:
--   - Están completamente pagados (monto_saldo = 0)
--   - Tienen el campo entregado = true (antigua lógica)
-- ============================================================

-- OPCIÓN 1: Actualizar basándose en campo "entregado" antiguo
-- Esta es la más segura y recomendada
UPDATE pedidos 
SET estado_pedido = 'entregado'
WHERE entregado = TRUE 
  AND estado_pedido = 'aceptado';

-- Verificar cuántos pedidos se actualizaron
SELECT 
  'Pedidos actualizados a entregado' as descripcion,
  COUNT(*) as cantidad
FROM pedidos 
WHERE estado_pedido = 'entregado';

-- OPCIÓN 2: Actualizar SOLO basándose en saldo = 0
-- (Úsala solo si la Opción 1 no funciona)
-- DESCOMENTAR si necesitas:
/*
UPDATE pedidos 
SET estado_pedido = 'entregado'
WHERE monto_saldo = 0 
  AND estado_pedido = 'aceptado'
  AND cancelado = FALSE;
*/

-- OPCIÓN 3: Actualizar pedidos específicos por nombre de cliente
-- Si solo quieres actualizar Carolina y Helga:
-- DESCOMENTAR si necesitas:
/*
UPDATE pedidos 
SET estado_pedido = 'entregado'
WHERE nombre_cliente IN ('Carolina', 'Helga')
  AND estado_pedido = 'aceptado'
  AND monto_saldo = 0;
*/

-- ============================================================
-- ACTUALIZAR PRODUCCIÓN A "TERMINADO" PARA PEDIDOS ENTREGADOS
-- ============================================================

-- Si el pedido ya está entregado, la producción DEBE estar terminada
UPDATE pedidos 
SET estado_produccion = 'terminado'
WHERE estado_pedido = 'entregado' 
  AND estado_produccion != 'terminado';

-- Ver pedidos entregados con producción terminada
SELECT 
  nombre_cliente,
  estado_pedido,
  estado_produccion,
  monto_saldo
FROM pedidos
WHERE estado_pedido = 'entregado';

-- ============================================================

-- Ver el resultado final
SELECT 
  id_pedido,
  nombre_cliente,
  fecha_pedido,
  estado_pedido,
  estado_produccion,
  monto_saldo,
  precio_total
FROM pedidos
WHERE nombre_cliente IN ('Carolina', 'Helga')
ORDER BY fecha_pedido DESC;
