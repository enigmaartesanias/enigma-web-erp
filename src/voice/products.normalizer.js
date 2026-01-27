// src/voice/products.normalizer.js
import { PRODUCTS_VOCAB } from "./products.vocab";
import { fuzzyMatch } from "./fuzzy";

const normalize = (text) =>
    text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

export function normalizeProduct(transcript) {
    const text = normalize(transcript);

    for (const product in PRODUCTS_VOCAB) {
        if (PRODUCTS_VOCAB[product].some(v => text.includes(v))) {
            return product;
        }
    }

    return fuzzyMatch(text, Object.keys(PRODUCTS_VOCAB));
}
