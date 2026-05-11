// Syntax token helpers.
// Usage: import { T, makeTokColor, makeSevColor, makeTagPalette } from './syntax';
// Call makeTokColor(C) / makeSevColor(C) / makeTagPalette(isDark) inside render with the live C.

export const T = (cls, text) => ({ cls, text });

export function makeTokColor(C) {
  return {
    kw: C.kw, type: C.type, str: C.str, num: C.num, fn: C.fn,
    cmt: C.cmt, punct: C.punct, plain: C.text, var: C.text,
    doctag: C.docTag, add: 'oklch(40% 0.13 145)', del: 'oklch(50% 0.16 25)',
  };
}

export function makeSevColor(C) {
  return (s) => ({
    red: C.sevRed, orange: C.sevOrange, yellow: C.sevYellow,
    blue: C.sevBlue, green: C.sevGreen, purple: C.sevPurple,
  }[s]);
}

const TAG_LIGHT = {
  blue:   { bg: 'oklch(96% 0.03 245)',  text: 'oklch(45% 0.12 245)', border: 'oklch(85% 0.06 245)' },
  green:  { bg: 'oklch(96% 0.03 145)',  text: 'oklch(42% 0.12 145)', border: 'oklch(85% 0.06 145)' },
  orange: { bg: 'oklch(96% 0.03 60)',   text: 'oklch(45% 0.13 60)',  border: 'oklch(85% 0.07 60)'  },
  red:    { bg: 'oklch(96% 0.03 25)',   text: 'oklch(48% 0.15 25)',  border: 'oklch(85% 0.07 25)'  },
  purple: { bg: 'oklch(96% 0.03 300)',  text: 'oklch(45% 0.13 300)', border: 'oklch(85% 0.06 300)' },
  gray:   { bg: 'oklch(96% 0.005 260)', text: 'oklch(40% 0.01 260)', border: 'oklch(88% 0.005 260)' },
};

const TAG_DARK = {
  blue:   { bg: 'oklch(20% 0.05 245)',  text: 'oklch(75% 0.14 245)', border: 'oklch(30% 0.07 245)' },
  green:  { bg: 'oklch(20% 0.05 145)',  text: 'oklch(72% 0.13 145)', border: 'oklch(30% 0.07 145)' },
  orange: { bg: 'oklch(20% 0.05 60)',   text: 'oklch(75% 0.15 60)',  border: 'oklch(30% 0.08 60)'  },
  red:    { bg: 'oklch(20% 0.05 25)',   text: 'oklch(72% 0.17 25)',  border: 'oklch(30% 0.08 25)'  },
  purple: { bg: 'oklch(20% 0.05 300)',  text: 'oklch(72% 0.15 300)', border: 'oklch(30% 0.07 300)' },
  gray:   { bg: 'oklch(22% 0.005 260)', text: 'oklch(62% 0.01 260)', border: 'oklch(32% 0.005 260)' },
};

export function makeTagPalette(isDark) {
  return isDark ? TAG_DARK : TAG_LIGHT;
}
