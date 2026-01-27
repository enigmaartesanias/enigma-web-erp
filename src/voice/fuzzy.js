// src/voice/fuzzy.js
import Fuse from "fuse.js";

export function fuzzyMatch(text, options) {
    if (!text || !options?.length) return null;

    const fuse = new Fuse(options, {
        threshold: 0.4,
        distance: 100,
        ignoreLocation: true
    });

    const result = fuse.search(text);
    return result.length ? result[0].item : null;
}
