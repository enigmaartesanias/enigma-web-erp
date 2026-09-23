import { supabase } from '../supabaseClient';

// Misma API que antes (getAll, getActive, create, update, delete),
// así que AndruDonaldsCollection.jsx no necesita cambios.
const makeTable = (table) => ({
    async getAll() {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .order('order_index', { ascending: true })
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getActive() {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('is_active', true)
            .order('order_index', { ascending: true })
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async create(d) {
        const { data, error } = await supabase
            .from(table)
            .insert({
                image_url: d.image_url,
                descripcion: d.descripcion || null,
                order_index: d.order_index || 0,
                is_active: d.is_active !== undefined ? d.is_active : true,
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Solo actualiza los campos que realmente se envían
    // (antes, un update sin "descripcion" la dejaba en null).
    async update(id, d) {
        const changes = {};
        if (d.descripcion !== undefined) changes.descripcion = d.descripcion;
        if (d.order_index !== undefined) changes.order_index = d.order_index;
        if (d.is_active !== undefined) changes.is_active = d.is_active;

        const { data, error } = await supabase
            .from(table)
            .update(changes)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
    },
});

export const andruDonaldsDB = makeTable('andru_donalds_images');
export const andruProductosDB = makeTable('andru_productos_images');
