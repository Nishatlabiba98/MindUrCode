// Design tokens. Import as: import { C } from './theme';
export const C = {
  bg: 'oklch(99% 0.002 260)',
  panel: '#ffffff',
  panelAlt: 'oklch(98.5% 0.003 260)',
  border: 'oklch(91% 0.005 260)',
  borderStrong: 'oklch(85% 0.006 260)',
  text: 'oklch(22% 0.02 260)',
  textDim: 'oklch(50% 0.015 260)',
  textMute: 'oklch(65% 0.012 260)',
  gutterBg: 'oklch(97% 0.004 260)',
  gutterText: 'oklch(70% 0.012 260)',
  accent: 'oklch(48% 0.13 250)',
  accentSoft: 'oklch(95% 0.03 250)',
  good: 'oklch(60% 0.13 145)',
  goodSoft: 'oklch(95% 0.04 145)',
  warn: 'oklch(60% 0.16 60)',
  warnSoft: 'oklch(95% 0.04 60)',
  // syntax
  kw: 'oklch(42% 0.16 280)',
  type: 'oklch(45% 0.13 220)',
  str: 'oklch(48% 0.13 30)',
  num: 'oklch(50% 0.13 60)',
  fn: 'oklch(45% 0.14 250)',
  cmt: 'oklch(60% 0.02 260)',
  punct: 'oklch(40% 0.01 260)',
  docTag: 'oklch(50% 0.10 200)',
  // severity
  sevRed: 'oklch(60% 0.19 25)',
  sevOrange: 'oklch(72% 0.16 60)',
  sevYellow: 'oklch(80% 0.14 90)',
  sevBlue: 'oklch(60% 0.15 245)',
  sevGreen: 'oklch(60% 0.13 145)',
  sevPurple: 'oklch(58% 0.16 300)',
  // coverage
  covGreen: 'oklch(70% 0.16 145)',
  covYellow: 'oklch(82% 0.16 90)',
  covRed: 'oklch(65% 0.20 25)',
};

export function btnStyle(primary) {
  return {
    height: 32, padding: '0 14px', fontSize: 12.5, fontWeight: 500,
    background: primary ? C.text : C.panel,
    color: primary ? '#fff' : C.text,
    border: `1px solid ${primary ? C.text : C.border}`,
    borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
  };
}

export function iconBtn(strong) {
  return {
    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6,
    color: strong ? C.good : C.textDim, cursor: 'pointer',
  };
}
