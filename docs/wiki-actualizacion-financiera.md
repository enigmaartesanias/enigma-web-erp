# Actualización Financiera y Trazabilidad de Costos Reales (Abril 2026)

Esta actualización representa la evolución de Enigma ERP desde una plataforma enfocada en la producción e inventario básico, hacia una **herramienta de gestión financiera completa y análisis de rentabilidad real**.

## 🚀 Cambios Implementados

### 1. Costeos de Producción Quirúrgicos
Se agregaron nuevos parámetros que permiten medir exactamente los márgenes de rentabilidad, evitando depender de presupuestos o valores sugeridos en la etapa de producción:
*   **Horas de Trabajo Real:** A diferencia del tiempo estimado, este nuevo registro evalúa las horas que realmente le toma a la operación culminar el lote.
*   **Sueldo Hora Objetivo:** Permite valorizar la mano de obra sin necesidad de que el usuario tenga un salario fijo asignado, flexibilizando el cálculo.
*   **Costo Empaque y Costo Envío Asumido:** Estos elementos, que solían ser "gastos invisibles" que impactaban a las ganancias, ahora son deducidos automáticamente durante el ensamble.

### 2. Prorrateo Dinámico de Costos Estructurales
Se introdujo una mecánica que integra los Gastos Fijos (Alquiler, Herramientas, Luz) en el flujo de cada producto de manera proporcional.
*   **Piezas por mes (\`piezas_mes\`):** El sistema calcula la cantidad total de artículos físicos procesados en el mes activo a través de un nuevo endpoint en el \`dashboardNeonClient\`.
*   **Distribución Diaria/por pieza (\`CF Prorrateado\`):** Ahora el *Costo Fijo de Producción* varía en base a qué tan productivos fuimos en el mes, brindando un valor mucho más exacto a productos simples y productos premium.

### 3. Módulo Dinámico de Deudas
Se implementó el componente avanzado **\`DeudasPanel.jsx\`** en la ventana de **Finanzas (Gastos.jsx)**, permitiendo independizar el flujo de efectivo del gasto operativo.
*   Lista y separa las deudas con Entidades/Bancos o Terceros.
*   Panel visual claro: Progreso porcentual y barras de amortización (Total deuda vs Capital Pendiente).
*   Se asegura que abonar una deuda influya correctamente en la tesorería pero **no** ensucie el historial de rentabilidad del taller.

### 4. Nuevo Dashboard Financiero
Se actualizó y añadió un nuevo acceso desde el **Enigma Sistema ERP (InventarioHome)**:
*   Se integra el componente **Dashboard** dentro del flujo comercial y logístico, facilitando las decisiones.

---

## 💡 Sugerencias Adicionales y Flujos Futuros Recomendados

El estado actual del ERP es sólido y robusto. No obstante, para llevarlo al siguiente nivel de automatización, sugerimos iterar sobre las siguientes lógicas:

1.  **Cálculo CF (Costo Fijo) 100% Autónomo:** Actualizar el número \`64.58\` (Costo Diario Fijo Referencial) para que provenga directamente del cálculo dinámico (Total de Gasto Fijo / Días Laborales). Así el sistema calibrará solo cada mes sin mover código.
2.  **Rentabilidad Neta en Módulo Ventas:** Que al vender en el panel de Ventas, el vendedor y administrador puedan ver la *Utilidad Neta* real después de deducir este nuevo \`Costo Total de Producción\` en tiempo real, no solo un monto aproximado.
3.  **Seguimiento de Eficiencia en Dashboard de Producción:** Crear un cruce de tiempos ("Horas de Trabajo Real" vs "Horas Sugeridas/Cotizadas"), muy útil para recompensar al orfebre o replantear precios base de cara a nuevos lotes. 
4.  **Flujo para Merma (Desperdicio Valioso):** Habilitar el guardado del polvo o restos utilizables de metal y conectarlos al \`stock_inicial\` como activo recuperado, cerrando el bucle contable perfecto.
