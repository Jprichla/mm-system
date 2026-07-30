import { readFileSync } from 'node:fs';

const stylesheet = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');

function extractTokens(selector) {
  const selectorStart = stylesheet.indexOf(selector);
  if (selectorStart === -1) throw new Error(`Missing theme selector: ${selector}`);

  const blockStart = stylesheet.indexOf('{', selectorStart);
  const blockEnd = stylesheet.indexOf('}', blockStart);
  const tokens = new Map();

  for (const match of stylesheet.slice(blockStart + 1, blockEnd).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    tokens.set(match[1], match[2].trim());
  }

  return tokens;
}

function resolveToken(tokens, token, seen = new Set()) {
  if (seen.has(token)) throw new Error(`Circular token reference: ${[...seen, token].join(' -> ')}`);
  const value = tokens.get(token);
  if (!value) throw new Error(`Missing color token: ${token}`);

  const reference = value.match(/^var\((--[\w-]+)\)$/);
  if (!reference) return value;

  return resolveToken(tokens, reference[1], new Set([...seen, token]));
}

function parseHex(value) {
  const match = value.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (!match) throw new Error(`Expected a hex color, received: ${value}`);

  const hex = match[1].length === 3
    ? [...match[1]].map((character) => character.repeat(2)).join('')
    : match[1];

  return [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}

function relativeLuminance(value) {
  return parseHex(value)
    .map((channel) => channel / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((luminance, channel, index) => luminance + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrastRatio(foreground, background) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

const lightTokens = extractTokens(':root');
const darkTokens = new Map([...lightTokens, ...extractTokens("[data-theme='dark']")]);

const checks = [
  ...[
    ['muted text on panel', '--text-muted', '--bg-panel', 4.5],
    ['muted text on elevated surface', '--text-muted', '--bg-elevated', 4.5],
    ['accent text on panel', '--accent-text', '--bg-panel', 4.5],
    ['accent text on elevated surface', '--accent-text', '--bg-elevated', 4.5],
    ['accent text on accent-soft surface', '--accent-text', '--accent-soft', 4.5],
    ['header muted text on header', '--header-text-muted', '--header-bg', 4.5],
    ['header accent text on header', '--header-accent-text', '--header-bg', 4.5],
    ['header accent text on header control', '--header-accent-text', '--header-control-bg', 4.5],
    ['header focus indicator beside header', '--header-focus', '--header-bg', 3],
    ['header focus indicator beside header control', '--header-focus', '--header-control-bg', 3],
    ['control border beside panel', '--control-border', '--bg-panel', 3],
    ['control border beside input surface', '--control-border', '--bg-elevated', 3],
    ['primary button text', '#ffffff', '--accent', 4.5],
    ['primary button hover text', '#ffffff', '--accent-hover', 4.5],
  ].map((check) => ['light', lightTokens, ...check]),
  ...[
    ['muted text on panel', '--text-muted', '--bg-panel', 4.5],
    ['muted text on elevated surface', '--text-muted', '--bg-elevated', 4.5],
    ['accent text on panel', '--accent-text', '--bg-panel', 4.5],
    ['accent text on elevated surface', '--accent-text', '--bg-elevated', 4.5],
    ['accent text on accent-soft surface', '--accent-text', '--accent-soft', 4.5],
    ['header muted text on header', '--header-text-muted', '--header-bg', 4.5],
    ['header accent text on header', '--header-accent-text', '--header-bg', 4.5],
    ['header accent text on header control', '--header-accent-text', '--header-control-bg', 4.5],
    ['header focus indicator beside header', '--header-focus', '--header-bg', 3],
    ['header focus indicator beside header control', '--header-focus', '--header-control-bg', 3],
    ['control border beside panel', '--control-border', '--bg-panel', 3],
    ['control border beside input surface', '--control-border', '--bg-elevated', 3],
    ['primary button text', '#ffffff', '--accent', 4.5],
    ['primary button hover text', '#ffffff', '--accent-hover', 4.5],
  ].map((check) => ['dark', darkTokens, ...check]),
];

let failed = false;

for (const [theme, tokens, label, foregroundToken, backgroundToken, minimum] of checks) {
  const foreground = foregroundToken.startsWith('--')
    ? resolveToken(tokens, foregroundToken)
    : foregroundToken;
  const background = resolveToken(tokens, backgroundToken);
  const ratio = contrastRatio(foreground, background);
  const passed = ratio >= minimum;
  failed ||= !passed;
  console.log(
    `${passed ? 'PASS' : 'FAIL'} ${theme.padEnd(5)} ${label}: ${ratio.toFixed(2)}:1 (minimum ${minimum.toFixed(1)}:1; ${foreground} on ${background})`,
  );
}

if (failed) process.exitCode = 1;
