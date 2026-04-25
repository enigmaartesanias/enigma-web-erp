const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.VITE_DATABASE_URL);

const stmts = [
`ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS origen_pedido VARCHAR(20) DEFAULT 'INTERNET';`,

`ALTER TABLE produccion_taller
ADD COLUMN IF NOT EXISTS peso_material_gramos  DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS horas_trabajo_real    DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS es_bisuteria          BOOLEAN      DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS costo_empaque         DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS costo_envio_asumido   DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sueldo_hora_objetivo  DECIMAL(8,2) DEFAULT 15.00;`,

`ALTER TABLE gastos
ADD COLUMN IF NOT EXISTS subcategoria       VARCHAR(50),
ADD COLUMN IF NOT EXISTS afecta_produccion  BOOLEAN      DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS es_deuda           BOOLEAN      DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS acreedor           VARCHAR(100),
ADD COLUMN IF NOT EXISTS monto_total_deuda  DECIMAL(10,2);`,

`CREATE TABLE IF NOT EXISTS precios_metal (
  id           SERIAL       PRIMARY KEY,
  metal        VARCHAR(20)  NOT NULL,
  precio_gramo DECIMAL(8,4) NOT NULL,
  fecha        DATE         DEFAULT CURRENT_DATE,
  activo       BOOLEAN      DEFAULT TRUE
);`,

`INSERT INTO precios_metal (metal, precio_gramo) VALUES
('Cobre',     0.0800),
('Alpaca',    0.0450),
('Plata',     2.5000),
('Bronce',    0.0600),
('Bisuteria', 0.0000)
ON CONFLICT DO NOTHING;`,

`CREATE TABLE IF NOT EXISTS gastos_operativos_base (
  id            SERIAL       PRIMARY KEY,
  concepto      VARCHAR(100) NOT NULL,
  monto_mensual DECIMAL(8,2) NOT NULL,
  activo        BOOLEAN      DEFAULT TRUE
);`,

`INSERT INTO gastos_operativos_base (concepto, monto_mensual) VALUES
('Luz taller',              20.00),
('Gas',                      6.25),
('Lijas y abrasivos',       15.00),
('Herramientas desgaste',   15.00),
('Web anual prorrateada',    8.33);`,

`CREATE TABLE IF NOT EXISTS deudas (
  id                SERIAL        PRIMARY KEY,
  acreedor          VARCHAR(100)  NOT NULL,
  tipo              VARCHAR(30)   DEFAULT 'PERSONA',
  monto_total       DECIMAL(10,2) NOT NULL,
  monto_pagado      DECIMAL(10,2) DEFAULT 0,
  fecha_inicio      DATE          DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  estado            VARCHAR(20)   DEFAULT 'PENDIENTE',
  notas             VARCHAR(300),
  created_at        TIMESTAMPTZ   DEFAULT NOW()
);`,

`CREATE TABLE IF NOT EXISTS deuda_pagos (
  id          SERIAL        PRIMARY KEY,
  deuda_id    INTEGER       REFERENCES deudas(id) ON DELETE CASCADE,
  monto       DECIMAL(10,2) NOT NULL,
  fecha_pago  DATE          DEFAULT CURRENT_DATE,
  metodo_pago VARCHAR(30),
  nota        VARCHAR(200),
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);`,

`INSERT INTO deudas (acreedor, tipo, monto_total, monto_pagado, fecha_vencimiento, estado, notas) VALUES
('Cuotas semanales',    'ENTIDAD', 440.00,  0, '2026-05-18', 'PENDIENTE', 'S/110 cada domingo: 27 abr, 4, 11, 18 may'),
('Familiar',            'PERSONA', 140.00,  0, '2026-04-30', 'VENCIDO',   'URGENTE â€” pagar fin de abril'),
('PrÃ©stamo A',          'ENTIDAD', 870.00,  0, '2026-02-28', 'VENCIDO',   'Vencido feb â€” negociar mÃ­nimo mensual S/100'),
('PrÃ©stamo B',          'ENTIDAD', 1150.00, 0, '2026-04-30', 'VENCIDO',   'Vencido abr â€” negociar mÃ­nimo mensual S/100'),
('Deuda con interÃ©s',   'PERSONA', 700.00,  0, NULL,         'PENDIENTE', 'Sin presiÃ³n â€” amortizar de a pocos'),
('Alquiler local',      'ENTIDAD', 400.00,  0, '2026-05-17', 'PENDIENTE', 'Vence 17 mayo â€” cubierto con ventas tienda')
ON CONFLICT DO NOTHING;`,

`CREATE OR REPLACE VIEW v_reporte_financiero_mensual AS
WITH
ingresos AS (
  SELECT
    TO_CHAR(fecha_pedido AT TIME ZONE 'America/Lima', 'YYYY-MM') AS periodo,
    SUM(precio_total_sin_igv)   AS total_ingresos,
    COUNT(*)                    AS num_pedidos,
    SUM(CASE WHEN COALESCE(origen_pedido,'INTERNET') = 'INTERNET'
        THEN precio_total_sin_igv ELSE 0 END) AS ventas_internet,
    SUM(CASE WHEN origen_pedido = 'TIENDA'
        THEN precio_total_sin_igv ELSE 0 END) AS ventas_tienda
  FROM pedidos
  WHERE estado_pedido = 'entregado'
  GROUP BY 1
),
costos AS (
  SELECT
    TO_CHAR(fecha_produccion, 'YYYY-MM')     AS periodo,
    SUM(costo_materiales)                    AS total_materiales,
    SUM(mano_de_obra)                        AS total_mano_obra,
    SUM(costo_herramientas)                  AS total_herramientas,
    SUM(COALESCE(costo_empaque,0))           AS total_empaque,
    SUM(COALESCE(costo_envio_asumido,0))     AS total_envio,
    COUNT(*)                                 AS piezas_producidas
  FROM produccion_taller
  WHERE estado_produccion = 'terminado'
  GROUP BY 1
),
gastos_mes AS (
  SELECT
    periodo,
    SUM(CASE WHEN tipo_gasto='FIJO'     THEN monto ELSE 0 END) AS gastos_fijos,
    SUM(CASE WHEN tipo_gasto='VARIABLE' THEN monto ELSE 0 END) AS gastos_variables
  FROM gastos
  GROUP BY 1
)
SELECT
  COALESCE(i.periodo, c.periodo, g.periodo)   AS periodo,
  COALESCE(i.total_ingresos, 0)               AS ingresos_total,
  COALESCE(i.ventas_internet, 0)              AS ventas_internet,
  COALESCE(i.ventas_tienda, 0)               AS ventas_tienda,
  COALESCE(i.num_pedidos, 0)                 AS num_pedidos,
  COALESCE(c.total_materiales, 0)            AS costo_materiales,
  COALESCE(c.total_mano_obra, 0)             AS costo_mano_obra,
  COALESCE(c.total_herramientas, 0)          AS costo_herramientas,
  COALESCE(c.total_empaque, 0)               AS costo_empaque,
  COALESCE(c.total_envio, 0)                 AS costo_envio,
  COALESCE(c.piezas_producidas, 0)           AS piezas_producidas,
  COALESCE(g.gastos_fijos, 0)               AS gastos_fijos,
  COALESCE(g.gastos_variables, 0)           AS gastos_variables,
  -- RESULTADO NETO
  COALESCE(i.total_ingresos, 0)
    - COALESCE(c.total_materiales, 0)
    - COALESCE(c.total_herramientas, 0)
    - COALESCE(c.total_empaque, 0)
    - COALESCE(c.total_envio, 0)
    - COALESCE(g.gastos_fijos, 0)
    - COALESCE(g.gastos_variables, 0)         AS resultado_neto,
  -- PUNTO DE EQUILIBRIO: pulseras cobre a S/80 necesarias
  CEIL((COALESCE(g.gastos_fijos,0) + 64.58) / 80.0) AS pulseras_equilibrio_80,
  CEIL((COALESCE(g.gastos_fijos,0) + 64.58) / 50.0) AS pulseras_equilibrio_50
FROM ingresos i
FULL OUTER JOIN costos c     ON i.periodo = c.periodo
FULL OUTER JOIN gastos_mes g ON i.periodo = g.periodo
ORDER BY periodo DESC;`
];

(async () => {
  try {
    for (let i = 0; i < stmts.length; i++) {
        await sql.query(stmts[i]);
        console.log("Migration cmd executed", i+1, "/", stmts.length);
    }
  } catch (e) {
    console.error("Migration failed:", e);
  }
})();
