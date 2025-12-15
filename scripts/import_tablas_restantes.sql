-- Migración de tablas restantes desde Supabase a Neon DB
-- Generado: 2025-12-14T23:33:11.991Z

-- Deshabilitar RLS
ALTER TABLE IF EXISTS productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stock_tienda DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS carousel_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS materiales DISABLE ROW LEVEL SECURITY;

-- Limpiar tablas
TRUNCATE TABLE stock_tienda, carousel_items, categorias, productos, materiales RESTART IDENTITY CASCADE;


-- MATERIALES
INSERT INTO materiales (nombre, activo) VALUES ('PLATA', undefined);
INSERT INTO materiales (nombre, activo) VALUES ('COBRE', undefined);
INSERT INTO materiales (nombre, activo) VALUES ('BRONCE', undefined);
INSERT INTO materiales (nombre, activo) VALUES ('ALPACA', undefined);

-- CATEGORÍAS
INSERT INTO categorias (id, nombre, descripcion, imagen_url, activo, orden) 
VALUES (1, 'ANILLO', NULL, 
'undefined', undefined, 0);
INSERT INTO categorias (id, nombre, descripcion, imagen_url, activo, orden) 
VALUES (2, 'ARETE', NULL, 
'undefined', undefined, 0);
INSERT INTO categorias (id, nombre, descripcion, imagen_url, activo, orden) 
VALUES (3, 'COLLAR', NULL, 
'undefined', undefined, 0);
INSERT INTO categorias (id, nombre, descripcion, imagen_url, activo, orden) 
VALUES (4, 'PULSERA', NULL, 
'undefined', undefined, 0);
INSERT INTO categorias (id, nombre, descripcion, imagen_url, activo, orden) 
VALUES (5, 'PERSONALIZADO', NULL, 
'undefined', undefined, 0);

-- PRODUCTOS
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (39, '', 4, 90, 'Pulsera en cobre con amatista natural
Pulsera artesanal hecha en cobre, trabajada con técnica de alambrismo y soldadura. Presenta un engaste con piedra amatista natural en un extremo y, en el otro terminal, una esfera que resguarda un pequeño cuarzo en su interior. Su diseño único combina lo ancestral con lo contemporáneo, evocando la fuerza mística del cobre como metal apreciado desde la antigüedad.
Tamaño aproximado: 18 cm (regulable).', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (41, '', 3, 120, 'Sol de plata con piedra reconstruidas ', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (44, '', 5, 60, 'Pulsera personalizada
He preparado una pulsera única con un centro de alpaca martillada y una placa de bronce dorado con nombre grabado.
Los terminales, también en alpaca, están reforzados para darle mayor resistencia y durabilidad.', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (45, '', 3, 50, 'Dijes con piedras ', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (35, '', 3, 35, 'Un nudo de bruja es un amuleto protector compuesto por símbolos poderosos que se entrelazan, representando los cuatro puntos cardinales y los cuatro elementos fundamentales: tierra, fuego, agua y aire', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (38, '', 4, 70, 'Inspirados en la energía del cobre
Brazalete ajustable hecho en 100% cobre macizo, con un delicado entorchado trenzado que resalta la fuerza y la elegancia del metal.
Cada pieza es hecha a mano, trabajada con técnica artesanal y soldada con dedicación.
Disponible en stock y también para preparar a pedido.

', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (20, '', 4, 80, '"Descubre la pulsera de cobre artesanal: un tributo a la tradición y a la belleza. Fabricada con técnicas ancestrales de alambrismo y soldadura, su acabado envejecido realza el cobre, un metal valorado por la antigua civilización inca y otros pueblos. Cada pulsera es única, puede personalizarse a tu medida, y combina la elegancia de un cuarzo natural con un diseño espiral.', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (40, '', 1, 30, 'Nuevos diseños en cobre 
He preparado anillos regulables con orgonitas, trabajados en cobre con acabado envejecido.
Cada pieza es única y lleva piedras naturales como pirita, turmalina, crisocola, turquesa, coral y serpentina.
💍 Artesanía exclusiva, lista para acompañarte con estilo y energía.', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (36, '', 4, 40, 'Modelo brazalete
Hecha a mano con técnica de soldadura y centro entorchado, una pieza única que además de lucir elegante, destaca por las propiedades ancestrales del cobre, conocido por fortalecer la inmunidad y brindar protección natural.', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (37, '', 5, 40, 'Cada pulsera personalizada está elaborada de manera artesanal, con dedicación y detalle, en cobre, bronce, alpaca y plata, además de diseños con tejidos que reflejan mi estilo único.', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (43, '', 3, 50, 'He preparado cinco dijes únicos, cada uno trabajado con dedicación en alambrismo, soldadura y un acabado envejecido que resalta su estilo artesanal.
Cada dije incluye una piedra reconstituida con resina, disponibles en:
🔹 Crisocola
🔹 Serpentina
🔹 Pirita
🔹 Ónix
🔹 Sodalita
Vienen con cuero incluido.', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (47, '', 5, 50, 'Pulsera de cobre con flor y grabado personalizado tiene un tejido y piedras de cuarzo, acabado martillado y envejecido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (46, '', 2, 0, 'Aretes en plata 950, tienen acabado envejecido con alambrismo y aplicaciones de piedras.', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (48, '', 1, 0, 'Anillos con ágatas en esfera regulables ', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (49, '', 1, 0, 'Anillo con piedra natural en alpaca regulable, acabado envejecido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (50, '', 1, 0, 'Anillos diversos con diferentes acabado de alambrismo, son regulables con acabado envejecido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (51, '', 1, 0, 'Anillo en alpaca con piedra de cuarzo rosado, en alambrismo, acabado envejecido y regulable', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (52, '', 1, 0, 'Anillos con piedras medianas de ágatas en alpaca , regulables', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (53, '', 1, 0, 'Anillo con doble piedra reconstituida en alpaca , con alambrismo y acabado envejecido , es regulable', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (54, '', 1, 0, 'Anillos en forma de sol en alambrismo de alpaca con piedras ágatas , son regulables ', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (67, '', 1, 0, NULL, NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (69, '', 3, 0, 'Dijes de alpaca soldados con técnica de alambrismo y acabado envejecido, piedra crisocola, Avalon y spondylus', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (70, '', 3, 0, 'Dijes soldados en alpacas, con alambrismo y piedras engastadas', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (74, '', 3, 0, 'Dije tejido con alpaca , acabado envejecido con piedra amatista natural', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (75, '', 3, 0, 'Dijes de alpaca con piedras y acabado envejecido ', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (76, '', 3, 0, 'Dijes tejidos en forma de sol con piedra labradorita y pirita', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (68, '', 3, 0, 'Juego de alpaca calado en forma de sol con resina y piedras reconstituidas.', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (77, '', 3, 0, 'Dijes calados con resina y piedras reconstituidas, varios modelos', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (72, '', 3, 0, 'Dije en forma de cruz con alpaca, alambrismo soldado y acabado envejecido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (78, '', 3, 0, 'Dijes de alpaca con cadena de acero , con piedras y piedras reconstituidas', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (79, '', 3, 0, 'Dijes tipo medalla con piedra pirita , medianos', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (80, '', 3, 0, 'Collares en alpaca, piedras naturales y engastadas, tejido en alambrismo soldado con cadena', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (81, '', 3, 0, 'Un trabajo especial, con 3 piedras reconstituidas, gargantilla, soldado y acabado envejecido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (82, '', 3, 0, NULL, NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (83, '', 3, 0, 'Dije con spondylus tipo medalla tiene cadena tejida también de alpaca', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (84, '', 3, 0, 'Dije con aplicación de bronce, tiene resina con piedras en su interior', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (86, '', 3, 0, 'Juego de alpaca con aplicación de bronce y nácar con collar de cuero', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (87, '', 3, 0, 'Dije en forma de luna con aplicación de bronce y muranos en alpaca con alambrismo envejecido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (88, '', 3, 0, 'Dije de alpaca con piedras reconstituidas y resina acabado envejecido con collar de cuero', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (85, '', 3, 0, 'Collar tejido con piedra , con un centro trenzado y cadena tejida en alpaca ', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (89, '', 3, 0, 'Juego en cobre en forma de sol calados tiene piedras reconstituidas y resina con acabado envejecido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (90, '', 3, 0, 'Dije en alpaca con alambrismo piedra turquesa reconstituida con cuero', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (73, '', 3, 0, 'Corona tejida con alpaca y piedra crisocola para la frente', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (91, '', 3, 0, 'Dije tejido en alpaca tipo sol con piedra crisocola engastada', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (92, '', 2, 0, 'Aretes calados de alpaca en forma de Sol son con poste tienen piedra y resina', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (95, '', 3, 50, 'Dije en alpaca con resina y nácar tornasol', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (93, '', 3, 50, 'Dije en alpaca soldado con engaste de piedra turmalina y cuero ', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (96, '', 3, 50, 'Dije en alpaca con un centro de piedras reconstituidas con crisocola y pirita , en resina.', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (97, '', 2, 0, 'Aretes de plata con acabado envejecido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (98, '', 2, 0, 'Aretes de plata colgantes con forma de flor, acabado envejecido.', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (99, '', 2, 0, 'Trepadores para una oreja, varios diseños.', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (100, '', 2, 0, 'Argollas de plata estilo tailandés con alambrismo', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (101, '', 2, 0, 'Argollas de plata con cadenas, medianos.', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (102, '', 2, 0, 'Un diseño de un trepado a presión estilo ramas ', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (103, '', 4, 0, 'Pulsera de plata con el colibrí nazca, tejida y regulable.', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (104, '', 4, 0, 'Pulsera en plata con centro de alambrismo y engaste de spondylus , con cadena tejida.', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (105, '', 4, 0, 'Pulsera de plata estilo envejecido con piedra amazonita', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (106, '', 4, 0, 'Pulsera de plata con acabado martillado y alambrismo, con piedra amatista', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (107, '', 4, 0, 'Pulsera de plata con un centro en el cuero y broche ', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (108, '', 4, 0, 'Pulseras con alambrismo varios colores en piedra', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (109, '', 4, 0, 'Pulseras en alpaca tipo brazaletes, varios colores en piedras', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (110, '', 4, 0, 'Pulseras en alpaca con piedras medianas, estilo brazalete', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (111, '', 4, 0, 'Pulseras en alpaca con cuarzos ágatas, varios colores en piedras naturales', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (112, '', 4, 0, 'Pulsera en alpaca martillada con un engaste de spondylus', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (113, '', 4, 0, 'Pulsera de alpaca martillada con un engaste de avalón, acabado envejecido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (114, '', 4, 0, 'Pulseras con un centro de alambrismo en alpaca soldado, varios modelos', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (115, '', 4, 0, 'Pulseras de cuero con tres metales, con alpaca, cobre y bronce, piedras ágatas engastadas', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (116, '', 4, 0, 'Pulsera en alpaca con muchas técnicas de acabados, engastado con piedra turquesa reconstituida', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (117, '', 4, 0, 'Una pulsera tejida en alpaca con estilo de cadena flor de Egipto, soldada y acabado envejecido, tiene una turquesa reconstituida', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (118, '', 4, 0, 'Pulsera de alpaca con centro tejido en alambrismo estilo brazalete con piedras', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (120, '', 2, 0, 'Aretes con aplicaciones de bronce', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (121, '', 2, 0, 'Aretes con aplicaciones de bronce', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (138, '', 1, 0, 'Anillo de cobre con piedra crisocola acabado envejecido y es regulable', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (119, '', 2, 0, 'Aretes con aplicaciones de bronce', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (122, '', 1, 0, 'Anillo de cobre, son regulables ', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (123, '', 1, 0, 'Anillo con piedra amatista', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (124, '', 1, 0, 'Anillo con onix', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (125, '', 1, 0, 'Anillo con piedra pirita', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (126, '', 1, 0, 'Anillos de plata', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (127, '', 1, 0, 'Anillos de plata', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (128, '', 1, 0, 'Anillos de plata', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (129, '', 1, 0, 'Anillos de plata', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (130, '', 3, 0, 'Collar de plata', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (131, '', 3, 0, 'Collar de plata', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (132, '', 2, 0, 'Aretes de alpaca', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (133, '', 2, 0, 'Aretes de alpaca', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (134, '', 2, 0, 'Aretes de alpaca', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (135, '', 2, 50, 'Aretes de cobre ', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (136, '', 5, 0, 'Dije de alpaca con cadena de acero cada dije tiene una inicial', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (137, '', 5, 0, 'Pulsera de bronce personalizada con dos iniciales en los extremos de la placa acabado con cuero y broche en bronce', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (139, '', 1, 0, 'Anillo de cobre con piedra ojo de tigre acabado envejecido con técnica de alambrismo es regulable a pedido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (140, '', 1, 0, 'Anillo de cobre con engaste de concha Avalon, técnica de alambrismo con acabado envejecido es regulable, a pedido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (141, '', 1, 0, 'Anillo en cobre con piedra amatista natural tiene acabado envejecido y técnica de alambrismo a pedido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (142, '', 1, 50, 'Añadir anillo de cobre con base estilo con acabado de alambrismo tienen gastado una piedra crisocola es regulable. Diseño a pedido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (143, '', 1, 50, 'Anillo de cobre con un engaste de piedra amatista tiene acabado entorchado y es regulable. Diseño apellido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (144, '', 1, 40, 'Anillo de cobre con piedra crisocola reconstituida encima tiene una orgonita de cobre y está cubierta con resina v es regulable', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (145, '', 1, 40, 'Anillo de cobre con piedras serpentina reconstituida tiene una orgonita de cobre con resina es regulable', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (146, '', 1, 0, 'Anillo en cobre con piedras sodalita tiene acabado envejecido con técnica de alambrismo es regulable', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (147, '', 1, 0, 'Anillo con piedra labradorita acabado envejecido y regulable', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (148, '', 1, 0, 'Anillo de cobre con spondylus, acabado envejecido y regulable ', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (149, '', 1, 0, 'Anillo de cobre con piedra crisocola tiene acabado envejecido es regulable', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (150, '', 1, 0, 'Anillo de plata con piedra amatista', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (151, '', 1, 0, 'Anillo de plata con piedra amatista tiene técnica de alambrismo', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (152, '', 4, 0, 'Pulsera de cobre con piedra Luna tiene acabado envejecido con la técnica de alambrismo está soldada y se puede hacer a medida', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (153, '', 4, 0, 'Pulsera de cobre con acabado envejecido y técnica de alambrismo está soldada y tiene un engaste de piedras crisocolas se puede hacer a pedido y a medida', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (154, '', 4, 0, 'Pulsera de cobre con acabado envejecido y técnica de alambrismo tienen gastado una piedra turquesa reconstituida se puede preparar personalizado a pedido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (155, '', 4, 0, 'Pulsera de cobre con turquesa en cascajo tiene aplicaciones de bronce y está soldada se puede preparar a medida', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (156, '', 4, 0, 'Pulsera de cobre tipo brazalete tiene acabado envejecido con técnica de martillado está soldada y con engastes de piedras se puede preparar a medida', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (157, '', 4, 0, 'Pulsera de cobre con acabado envejecido con técnica de alambrismo soldado tiene un engaste de ágatas estilo brazalete se puede preparar a medida', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (158, '', 4, 0, 'Pulsera de cobre con centro de alambrismo y una mariposa calada está tejida con hilo chino y es regulable a pedido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (159, '', 4, 0, 'Pulsera de cobre estilo brazalete con técnica de martillado tiene un centro entorchado con alambrismo y una mariposa calada con una piedra reconstituida en resina se prepara a pedido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (160, '', 4, 0, 'Pulsera de cobre con acabado martillado y aplicaciones de bronce es con broche tipo cadena brazalete se hace a pedido tiene un engaste de piedra crisocola', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (161, '', 4, 0, 'Brazalete en cobre con piedra spondylus tiene acabado envejecido y un calado de lagarto estilo nazca se prepara pedido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (162, '', 4, 0, 'Pulsera de cobre con técnica envejecida y de alambrismo tiene bastantes entorchado por lo general son piezas únicas tiene un engaste de piedra luna reconstituida se prepara a pedido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (163, '', 4, 0, 'Brazalete en cobre con acabado martillado tiene en el centro una aplicación de piedras reconstituidas con resina estilo envejecido se prepara apellido', NULL, '', 0, NULL, NULL, true, false);
INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (164, '', 4, 0, 'Pulsera brazalete de cobre con acabado envejecido tiene también técnica de martillado y un cuarzo cristal en el centro se prepara a pedido', NULL, '', 0, NULL, NULL, true, false);

-- STOCK TIENDA
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');
INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (undefined, undefined, 'undefined');

-- CAROUSEL ITEMS
INSERT INTO carousel_items (id, imagen_url, titulo, descripcion, orden, activo, link) 
VALUES (23, 'undefined', NULL, 
NULL, undefined, undefined, NULL);
INSERT INTO carousel_items (id, imagen_url, titulo, descripcion, orden, activo, link) 
VALUES (24, 'undefined', NULL, 
NULL, undefined, undefined, NULL);
INSERT INTO carousel_items (id, imagen_url, titulo, descripcion, orden, activo, link) 
VALUES (25, 'undefined', NULL, 
NULL, undefined, undefined, NULL);
INSERT INTO carousel_items (id, imagen_url, titulo, descripcion, orden, activo, link) 
VALUES (26, 'undefined', NULL, 
NULL, undefined, undefined, NULL);
INSERT INTO carousel_items (id, imagen_url, titulo, descripcion, orden, activo, link) 
VALUES (27, 'undefined', NULL, 
NULL, undefined, undefined, NULL);
INSERT INTO carousel_items (id, imagen_url, titulo, descripcion, orden, activo, link) 
VALUES (33, 'undefined', NULL, 
NULL, undefined, undefined, NULL);

-- Verificación
SELECT 'Productos' as tabla, COUNT(*) FROM productos
UNION ALL SELECT 'Categorías', COUNT(*) FROM categorias
UNION ALL SELECT 'Stock', COUNT(*) FROM stock_tienda
UNION ALL SELECT 'Carousel', COUNT(*) FROM carousel_items
UNION ALL SELECT 'Materiales', COUNT(*) FROM materiales;
