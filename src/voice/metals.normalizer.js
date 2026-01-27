// src/voice/metals.normalizer.js
import { METALS_VOCAB } from "./metals.vocab";
import { fuzzyMatch } from "./fuzzy";

const normalize = (text) =>
    text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

export function normalizeMetal(transcript) {
    const text = normalize(transcript);

    for (const metal in METALS_VOCAB) {
        if (METALS_VOCAB[metal].some(v => text.includes(v))) {
            return metal;
        }
    }

    return fuzzyMatch(text, Object.keys(METALS_VOCAB));
}
