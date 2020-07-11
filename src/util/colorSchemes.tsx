import chroma from "chroma-js";

/**
 * Color Schemes
 * Credits: https://gka.github.io/chroma.js/#chroma-brewer
 */
export const customColorSchemes = {
    Meine: chroma.scale(["#6d32a8", "#326da8", "#32a8a8", "#6da832"]).colors(8),
    MeineBoolean: chroma.scale(["#326da8", "#32a8a8"]).colors(2),
    MeineViolet: chroma.scale(["#6435c9"]).colors(1),
    ...chroma.brewer
};
