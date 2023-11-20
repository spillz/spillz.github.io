//@ts-check

/**@typedef {[number, number, number, number]} ColorVals */

/**
 * 
 * @param {ColorVals} c1 
 * @param {ColorVals} c2 
 * @param {number} wgt 
 * @returns 
 */
function colorAvg(c1, c2, wgt) {
    return c1.map((a, index) => wgt * a + (1 - wgt) * c2[index]);
}

/**
 * 
 * @param {ColorVals} color 
 */
function convertColor(color) {
    let i=0;
    /**@type {ColorVals} */
    const result = [0,0,0,0];
    for(let c of color) {
        result[i] = i<=2?Math.floor(c * 255): c;
        i++;
    }
    return result;
}

const defaultTheme = {
    'background': convertColor([0.7, 0.7, 0.9, 1]),
    'tile': convertColor([0.5, 0.5, 0.75, 1]),
    'tileSelected': convertColor([0, 0, 0.5, 1]),
    'tileInactive': convertColor([0.7, 0.7, 0.7, 1]),
    'tileLetterText': convertColor([0.9, 0.9, 0.9, 1]),
    'wordScoreBackground': convertColor([0, 0, 0.5, 1]),
    'wordScoreText': convertColor([0.9, 0.9, 0.9, 1]),
    'scoreText': convertColor([0.9, 0.9, 0.9, 1]),
    'checker': convertColor([0.8, 0.8, 0.9, 1]),
    'moveCandidates': convertColor([0.2, 0.3, 0.7, 1]),
    'menuButtonBackground': convertColor([0.5, 0.8, 0.7, 1]),
    'menuButtonForeground': convertColor([0.9, 0.9, 0.9, 1]),
    'menuButtonForegroundDisabled': convertColor([0.5, 0.5, 0.5, 1])
};


const beachTheme = {
    'background': [20, 140, 156, 1],
    'tile': [255, 241, 156, 1],
    'tileSelected': [232, 180, 120, 1],
    'tileInactive': [200, 200, 200, 1],
    'tileLetterText': [86, 148, 155, 1],
    'wordScoreBackground': [252, 200, 130, 1],
    'wordScoreText': [86, 148, 155, 1],
    'scoreText': [221, 238, 242, 1],
    'checker': [0, 202, 199, 1],
    'moveCandidates': [252, 200, 130, 1],
    'menuButtonBackground': [252, 136, 61, 1],
    'menuButtonForeground': [255, 255, 255, 1],
    'menuButtonForegroundDisabled': [128, 128, 128, 1]
};

export const themes = {
    'default': defaultTheme,
    'beach': beachTheme
};


export function loadTheme(themeName) {
    const themeBase = themes[themeName];

    let theme = {};
    for(let c in themeBase) {
        theme[c] = themeBase[c];
    }

    theme['bronze'] = [205, 127, 50 , 1.0];
    /**@type {ColorVals} */
    theme['silver'] = [208, 208, 208, 1.0];
    theme['gold'] = [255, 215, 0, 1.0];

    const bg = theme['background'];
    theme['bronzeOff'] = colorAvg(theme['silver'], bg, 0.5);
    theme['silverOff'] = colorAvg(theme['silver'], bg, 0.5);
    theme['goldOff'] = colorAvg(theme['silver'], bg, 0.5);


    for(let t in theme) {
        let [r,g,b,a] = theme[t];
        theme[t] = `rgba(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)},${a})`;
    }
    theme['id'] = themeName;

    // Set global variables or return the theme
    // Depending on how you want to use it in your application
    return theme;
}
