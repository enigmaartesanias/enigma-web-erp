-- ============================================================
-- CÁLCULO DINÁMICO DEL ESTADO DE PRODUCCIÓN
-- ============================================================
-- Este query muestra cómo se calcula el estado de producción
-- en tiempo real basándose en los items de produccion_taller

-- Ejemplo de cálculo para el pedido de Liliana (2 productos)
SELECT 
  p.id_pedido,
  p.nombre_cliente,
  COUNT(pt.id_produccion) as total_items,
  COUNT(CASE WHEN pt.estado_produccion = 'terminado' THEN 1 END) as items_terminados,
  COUNT(CASE WHEN pt.estado_produccion = 'en_proceso' THEN 1 END) as items_en_proceso,
  
  -- Lógica de cálculo del estado
  CASE
    -- Si no hay items en producción
    WHEN COUNT(pt.id_produccion) = 0 THEN 'no_iniciado'
    
    -- Si todos los items están terminados
    WHEN COUNT(CASE WHEN pt.estado_produccion = 'terminado' THEN 1 END) = COUNT(pt.id_produccion) 
      THEN 'terminado'
    
    -- Si ningún item ha iniciado (todos están en estado inicial)
    WHEN COUNT(CASE WHEN pt.estado_produccion IN ('en_proceso', 'terminado') THEN 1 END) = 0 
      THEN 'no_iniciado'
    
    -- Si algunos items están en proceso o terminados
    ELSE 'en_proceso'
  END as estado_produccion_calculado

FROM pedidos p
LEFT JOIN produccion_taller pt ON pt.pedido_id = p.id_pedido
WHERE p.nombre_cliente = 'Liliana'
GROUP BY p.id_pedido;

-- ============================================================
-- EJEMPLOS DE ESTADOS
-- ============================================================

-- Ejemplo 1: Pedido con 3 productos, ninguno iniciado
-- → 🟡 No iniciado

-- Ejemplo 2: Pedido con 3 productos, 1 en proceso, 2 sin iniciar
-- → 🔵 En proceso

-- Ejemplo 3: Pedido con 3 productos, 2 terminados, 1 en proceso
-- → 🔵 En proceso

-- Ejemplo 4: Pedido con 3 productos, todos terminados
-- → 🟢 Terminado
