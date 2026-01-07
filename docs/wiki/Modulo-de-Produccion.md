# 🛠️ Módulo de Producción - Modelo Artesanal

Este módulo gestiona la fabricación de joyas, permitiendo controlar costos, insumos y el paso a inventario de productos terminados.

## 🎨 Modelo Artesanal (Enero 2026)

El sistema utiliza un **Modelo de Costos Simplificado** diseñado para talleres artesanales, enfocándose en costos directos en lugar de control de horas.

### 💰 Estructura de Costos

El Costo Total de Producción se calcula automáticamente con la siguiente fórmula:

$$ Costo Total = Materiales + Mano de Obra + Herramientas + Otros Gastos $$

| Campo | Descripción | Tipo |
|-------|-------------|------|
| **Costo Materiales** | Valor de la materia prima (plata, piedras, etc.) | Monetario (S/) |
| **Mano de Obra** | Valor asignado al trabajo del artesano (Pago directo) | Monetario (S/) |
| **Herramientas** | Desgaste o uso de herramientas específicas | Monetario (S/) |
| **Otros Gastos** | Insumos menores, electricidad, ácidos, etc. | Monetario (S/) |

> **Nota**: El campo **% Alquiler** es puramente *referencial*. Sirve para que el artesano visualize cuánto representa el alquiler del taller (ej. 20%) sobre el costo base, pero **NO se suma** al costo de producción del producto para no inflar el precio de inventario innecesariamente.

---

## 🔄 Flujo de Trabajo

### 1. Registro de Producción
- Se ingresa el producto a fabricar (Anillo, Pulsera, etc.).
- Se definen los costos estimados.
- Estado inicial: **En Proceso**.

### 2. Finalización
- Al terminar la joya, se marca el check ✅ en la lista.
- El estado cambia a **Terminado**.
- Se registra automáticamente la `fecha_terminado`.

### 3. Pase a Inventario
- Los productos terminados pueden enviarse al inventario con un clic.
- **Generación de Código**: Por defecto, el campo "Código" aparece **vacío** para permitir el ingreso manual o escaneo de una etiqueta existente.
- Se pre-llenan datos como Nombre, Costo Unitario y Categoría.

## 📋 Listado y Reportes
- **Visualización Limpia**: Se eliminaron columnas redundantes como códigos QR en la tabla principal.
- **Imágenes**: Visualización de miniaturas de productos.
- **Filtros**: Por estado (En Proceso / Terminado) y Fechas.
