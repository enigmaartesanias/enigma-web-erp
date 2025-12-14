# Guía de Migración de Pedidos: Supabase → Neon DB

## 📋 Requisitos Previos

- ✅ Backup de base de datos Supabase
- ✅ Variable `VITE_DATABASE_URL` configurada en `.env`
- ✅ Node.js instalado

---

## 🔧 Pasos de Migración

### Paso 1: Crear Esquema en Neon DB

Ejecuta el script SQL en tu consola de Neon DB:

```bash
# Opción A: Desde la consola SQL de Neon (recomendado)
# Copiar y pegar el contenido de scripts/neon_pedidos_schema.sql

# Opción B: Usando psql
psql "postgresql://neondb_owner:npg_PIU3bHc7oXTt@ep-bitter-pond-ahd82tev-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" -f scripts/neon_pedidos_schema.sql
```

### Paso 2: Ejecutar Script de Migración

```bash
cd C:\webagosto2025
node scripts/migrate_pedidos_supabase_to_neon.js
```

**Salida esperada:**
```
🚀 Iniciando migración de pedidos...
📤 Exportando datos de Supabase...
✅ 25 pedidos exportados de Supabase
📥 Importando datos a Neon DB...
  ✓ Pedido #1 → #1 migrado
  ✓ Pedido #2 → #2 migrado
  ...
✅ Migración completada exitosamente!
📊 Resumen:
   - Pedidos migrados: 25
   - Detalles migrados: 67
   - Pagos migrados: 43
🔍 Verificando datos en Neon DB...
   - Total pedidos en Neon: 25
   - Total en ventas: S/ 4,520.00
```

### Paso 3: Actualizar Código de Aplicación

El siguiente paso será actualizar `Pedidos.jsx` y `ReportePedidos.jsx` para usar Neon DB en lugar de Supabase.

**⚠️ NO ejecutar hasta confirmar que la migración de datos fue exitosa.**

---

## ✅ Verificación

Después de la migración, verifica manualmente en Neon DB:

```sql
-- Verificar total de pedidos
SELECT COUNT(*) FROM pedidos;

-- Verificar total de detalles
SELECT COUNT(*) FROM detalles_pedido;

-- Verificar total de pagos
SELECT COUNT(*) FROM pagos;

-- Comparar totales
SELECT 
  SUM(precio_total) as total_ventas,
  SUM(monto_a_cuenta) as total_pagado,
  SUM(monto_saldo) as total_pendiente
FROM pedidos;
```

---

## 🚨 En Caso de Error

Si algo sale mal durante la migración:

1. **NO** elimines datos de Supabase
2. Trunca las tablas en Neon:
   ```sql
   TRUNCATE TABLE pagos, detalles_pedido, pedidos RESTART IDENTITY CASCADE;
   ```
3. Vuelve a ejecutar el script de migración

---

## 📝 Notas Importantes

- ⏰ **Duración estimada**: 1-5 minutos (depende de cantidad de pedidos)
- 💾 **Espacio requerido**: Mínimo
- 🔒 **Downtime**: Ninguno (Supabase sigue activo)
- ⚠️ **Reversible**: Sí, solo no deployment el código actualizado

---

## ➡️ Siguiente Paso

Después de verificar que la migración fue exitosa, el siguiente paso es actualizar el código de `Pedidos.jsx` para usar Neon DB.

Ver: `scripts/README_ACTUALIZAR_CODIGO.md` (próximo archivo a crear)
