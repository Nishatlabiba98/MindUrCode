// Syntax token helpers. Import as: import { T, tokColor, sevColor, tagPalette } from './syntax';
import { C } from './theme';

export const T = (cls, text) => ({ cls, text });

export const tokColor = {
  kw: C.kw, type: C.type, str: C.str, num: C.num, fn: C.fn,
  cmt: C.cmt, punct: C.punct, plain: C.text, var: C.text,
  doctag: C.docTag, add: 'oklch(40% 0.13 145)', del: 'oklch(50% 0.16 25)',
};

export const sevColor = (s) => ({
  red: C.sevRed, orange: C.sevOrange, yellow: C.sevYellow,
  blue: C.sevBlue, green: C.sevGreen, purple: C.sevPurple,
}[s]);

export const tagPalette = {
  blue:   { bg: 'oklch(96% 0.03 245)', text: 'oklch(45% 0.12 245)', border: 'oklch(85% 0.06 245)' },
  green:  { bg: 'oklch(96% 0.03 145)', text: 'oklch(42% 0.12 145)', border: 'oklch(85% 0.06 145)' },
  orange: { bg: 'oklch(96% 0.03 60)',  text: 'oklch(45% 0.13 60)',  border: 'oklch(85% 0.07 60)' },
  red:    { bg: 'oklch(96% 0.03 25)',  text: 'oklch(48% 0.15 25)',  border: 'oklch(85% 0.07 25)' },
  purple: { bg: 'oklch(96% 0.03 300)', text: 'oklch(45% 0.13 300)', border: 'oklch(85% 0.06 300)' },
  gray:   { bg: 'oklch(96% 0.005 260)', text: 'oklch(40% 0.01 260)', border: 'oklch(88% 0.005 260)' },
};
