DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos' AND column_name = 'fecha_entrega') THEN
        ALTER TABLE pedidos ADD COLUMN fecha_entrega TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
