#!/usr/bin/env node
// Counts finish defects and contract drift in changed front-end files, so the finish gate is
// measured rather than felt. Source checks only: no network, no dependencies, no rendering.
// Usage: node count-finish.mjs [--json] [--fail-on error|warning|never] [--radius 8,12,16]
//        [--allow-gradients] <file ...>
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const MAX_FILE_BYTES = 1024 * 1024;
const FRONTEND_FILE = /\.(?:css|scss|sass|html|jsx|tsx|js|ts|mjs|vue|svelte|astro)$/i;
const TAILWIND_RADIUS = { none: 0, sm: 2, '': 4, md: 6, lg: 8, xl: 12, '2xl': 16, '3xl': 24, full: 9999 };
const NEUTRALS = new Set(['white', 'black', 'gray', 'slate', 'zinc', 'neutral', 'stone', 'transparent', 'current', 'inherit']);
const INTENTS = [
    ['start', /^(?:get started|start(?: now| free)?|begin|let'?s go|try (?:it|now|free))$/],
    ['signup', /^(?:sign up|signup|create (?:an )?account|register|join(?: now| free)?)$/],
    ['login', /^(?:log ?in|sign ?in)$/],
    ['buy', /^(?:buy(?: now)?|purchase|checkout|check out|order now|pay(?: now)?)$/],
    ['more', /^(?:learn more|read more|see more|discover(?: more)?|find out more|explore)$/],
    ['next', /^(?:continue|next|proceed|go on)$/],
    ['save', /^(?:save|save changes|apply|update)$/],
    ['cancel', /^(?:cancel|dismiss|close|never mind)$/],
];

function location(content, index) {
    const before = content.slice(0, Math.max(0, index));
    const lines = before.split('\n');
    return { line: lines.length, column: lines.at(-1).length + 1 };
}

function finding(file, content, index, rule, severity, message) {
    return { file, ...location(content, index), rule, severity, message };
}

export function checkInertControls(file, content) {
    const patterns = [
        { regex: /href\s*=\s*["']#["']/g, message: 'Placeholder href="#" leaves this control without a destination.' },
        { regex: /(?:onClick|onSubmit)\s*=\s*\{\s*(?:undefined|null|\(\s*\)\s*=>\s*(?:\{\s*\}|undefined|null))\s*\}/g, message: 'This interaction handler is empty or undefined.' },
        { regex: /<(?:button|a)\b[^>]*>[^<]*(?:TODO|coming soon|not implemented)[^<]*<\//gi, message: 'This visible control is explicitly marked unfinished.' },
    ];
    return patterns.flatMap(({ regex, message }) => [...content.matchAll(regex)].map(match => finding(file, content, match.index, 'inert-control', 'error', message)));
}

export function checkHardcodedColors(file, content) {
    const patterns = [
        /(?:color|backgroundColor|borderColor)\s*:\s*["'`]\s*(?:#[0-9a-f]{3,8}|rgba?\(|hsla?\()/gi,
        /\b(?:bg|text|border)-(?:white|black|(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))\b/g,
    ];
    if (/\.(?:css|scss|sass)$/i.test(file)) patterns.push(/\b(?:color|background|background-color|border-color)\s*:\s*(?:#[0-9a-f]{3,8}|rgba?\(|hsla?\()/gi);
    // One count per file: a token-based codebase still uses palette classes legitimately, and a hundred
    // line findings would bury the controls and states that matter. The contract decides what is drift.
    const matches = patterns.flatMap(regex => [...content.matchAll(regex)]);
    if (!matches.length) return [];
    const samples = [...new Set(matches.map(match => match[0]))].slice(0, 4).join(', ');
    return [finding(file, content, matches[0].index, 'raw-color-values', 'info', `${matches.length} raw colour value(s) such as ${samples}; the contract says which are tokens.`)];
}

export function checkMissingStates(file, content) {
    const dataDriven = /\b(?:fetch\s*\(|useQuery\s*\(|useSWR\s*\(|useLoaderData\s*\(|axios\.(?:get|post)\s*\()/m;
    if (!dataDriven.test(content) || !/<\w|return\s*\(/m.test(content)) return [];
    const lower = content.toLowerCase();
    const missing = [
        ['loading', /\b(?:loading|pending|skeleton)\b/],
        ['empty', /\b(?:empty|no results|no items|length\s*===?\s*0)\b/],
        ['error', /\b(?:error|failed|failure|catch\s*\()/],
    ].filter(([, marker]) => !marker.test(lower)).map(([name]) => name);
    if (!missing.length) return [];
    return [finding(file, content, content.search(dataDriven), 'missing-ui-states', 'warning', `Data-driven UI has no visible ${missing.join(', ')} state marker.`)];
}

export function checkGenericDashboard(file, content) {
    const lower = content.toLowerCase();
    const cues = [/\bdashboard\b/, /\b(?:grid-cols-[34]|repeat\s*\(\s*[34]\s*,)/, /\b(?:card|stat-card|metric-card)\b/, /\b(?:total revenue|active users|conversion rate|overview)\b/];
    if (cues.filter(cue => cue.test(lower)).length < 3) return [];
    return [finding(file, content, lower.search(/dashboard|grid-cols-[34]|stat-card|metric-card|total revenue|active users|conversion rate|overview/), 'generic-dashboard-cues', 'warning',
        'This screen combines several generic dashboard cues. Verify its hierarchy and metrics are specific to the product task.')];
}

export function checkEmojiInChrome(file, content) {
    const regex = /<(?:button|a|h[1-3]|nav|summary|label)\b[^>]*>[^<]*?\p{Extended_Pictographic}/gu;
    return [...content.matchAll(regex)].map(match => finding(file, content, match.index, 'emoji-in-chrome', 'warning', 'Emoji used as iconography in a control or heading; use the product icon set.'));
}

export function checkDecoration(file, content, { allowGradients = false } = {}) {
    const findings = [];
    if (!allowGradients) {
        for (const match of content.matchAll(/\b(?:from|via|to)-(?:indigo|violet|purple|fuchsia)-\d{2,3}\b|linear-gradient\([^)]*(?:#(?:4f46e5|6366f1|7c3aed|8b5cf6|a855f7|c084fc)|indigo|violet|purple)[^)]*\)/gi)) {
            findings.push(finding(file, content, match.index, 'default-gradient', 'warning', 'Purple/indigo gradient is the model default, not a brand choice.'));
        }
        for (const match of content.matchAll(/\bbg-gradient-to-\w+\b|(?:linear|radial|conic)-gradient\(/g)) {
            findings.push(finding(file, content, match.index, 'gradient', 'info', 'Gradient; keep only with a brand reason recorded in the contract.'));
        }
    }
    for (const match of content.matchAll(/\bbackdrop-blur(?:-\w+)?\b|backdrop-filter\s*:/g)) {
        findings.push(finding(file, content, match.index, 'glass', 'info', 'Glass/blur decoration; one deliberate surface at most.'));
    }
    for (const match of content.matchAll(/\bSparkles?\b|✨|\bconfetti\b/gi)) {
        findings.push(finding(file, content, match.index, 'sparkle', 'warning', 'Sparkle or confetti decoration is a model default.'));
    }
    return findings;
}

export function collectLabels(file, content) {
    const labels = [];
    for (const match of content.matchAll(/<(?:button|a|Button|Link)\b[^>]*>([^<{]{1,40})<\//g)) {
        const text = match[1].replace(/\p{Extended_Pictographic}/gu, '').replace(/\s+/g, ' ').trim().toLowerCase();
        const intent = INTENTS.find(([, pattern]) => pattern.test(text))?.[0];
        if (intent) labels.push({ file, ...location(content, match.index), intent, text });
    }
    return labels;
}

export function duplicateLabelFindings(labels) {
    const byIntent = new Map();
    for (const label of labels) byIntent.set(label.intent, [...(byIntent.get(label.intent) || []), label]);
    return [...byIntent.values()].flatMap(group => {
        const texts = [...new Set(group.map(label => label.text))];
        if (texts.length < 2) return [];
        const first = group[0];
        return [{ file: first.file, line: first.line, column: first.column, rule: 'duplicate-label', severity: 'warning',
            message: `One intent, several labels: ${texts.map(text => `"${text}"`).join(', ')}. Pick one wording.` }];
    });
}

export function collectRadii(content) {
    const values = new Set();
    for (const match of content.matchAll(/\brounded(?:-(?:t|b|l|r|tl|tr|bl|br))?(?:-(none|sm|md|lg|xl|2xl|3xl|full))?\b/g)) values.add(TAILWIND_RADIUS[match[1] || '']);
    for (const match of content.matchAll(/border-radius\s*:\s*([0-9.]+)(px|rem)/g)) values.add(match[2] === 'rem' ? Number(match[1]) * 16 : Number(match[1]));
    return [...values].filter(value => Number.isFinite(value));
}

function hueFamily(hex) {
    const value = hex.length === 4 ? hex.slice(1).split('').map(char => char + char).join('') : hex.slice(1, 7);
    const [r, g, b] = [0, 2, 4].map(start => Number.parseInt(value.slice(start, start + 2), 16) / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max - min < 0.12 || max < 0.08) return null;
    const delta = max - min;
    const hue = max === r ? ((g - b) / delta + 6) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
    return Math.round((hue * 60) / 30) % 12;
}

export function collectAccentHues(content) {
    const families = new Set();
    // Icon artwork and brand logos carry their own colours; they are not the interface's accent.
    const ui = content.replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ').replace(/\b(?:fill|stroke|stop-color|stopColor|flood-color)\s*[=:]\s*["']?#[0-9a-f]{3,8}/gi, ' ');
    for (const match of ui.matchAll(/#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/gi)) {
        const family = hueFamily(match[0].toLowerCase());
        if (family !== null) families.add(`hue-${family}`);
    }
    for (const match of ui.matchAll(/\b(?:bg|text|border|from|to|ring)-([a-z]+)-(?:[4-7]00)\b/g)) {
        if (!NEUTRALS.has(match[1])) families.add(match[1]);
    }
    return [...families];
}

export function countFinish(files, options = {}) {
    const findings = [];
    const labels = [];
    const radii = new Set();
    const hues = new Set();
    const scanned = [];
    for (const file of files) {
        if (!FRONTEND_FILE.test(file)) continue;
        let content;
        try {
            if (statSync(file).size > MAX_FILE_BYTES) continue;
            content = readFileSync(file, 'utf8');
        } catch {
            continue;
        }
        scanned.push(file);
        findings.push(...checkInertControls(file, content), ...checkHardcodedColors(file, content), ...checkMissingStates(file, content),
            ...checkGenericDashboard(file, content), ...checkEmojiInChrome(file, content), ...checkDecoration(file, content, options));
        labels.push(...collectLabels(file, content));
        for (const value of collectRadii(content)) radii.add(value);
        for (const hue of collectAccentHues(content)) hues.add(hue);
    }
    findings.push(...duplicateLabelFindings(labels));
    const scale = options.radiusScale || [];
    const offScale = scale.length ? [...radii].filter(value => !scale.includes(value)) : [];
    if (offScale.length) findings.push({ file: '(all)', line: 0, column: 0, rule: 'radius-off-scale', severity: 'warning',
        message: `Corner radii outside the stated scale: ${offScale.join(', ')}px.` });
    const counts = { scannedFiles: scanned.length, accentHues: [...hues], radii: [...radii].sort((a, b) => a - b),
        errors: findings.filter(item => item.severity === 'error').length, warnings: findings.filter(item => item.severity === 'warning').length };
    return { findings, counts };
}

function parseArgs(argv) {
    const options = { json: false, failOn: 'error', radiusScale: [], allowGradients: false };
    const files = [];
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === '--json') options.json = true;
        else if (arg === '--allow-gradients') options.allowGradients = true;
        else if (arg === '--fail-on') options.failOn = argv[++index];
        else if (arg === '--radius') options.radiusScale = String(argv[++index] || '').split(',').map(Number).filter(Number.isFinite);
        else files.push(arg);
    }
    if (!['error', 'warning', 'never'].includes(options.failOn)) throw new Error('--fail-on must be error, warning or never.');
    return { options, files };
}

export function exitCodeFor(counts, failOn) {
    if (failOn === 'never') return 0;
    if (counts.errors) return 1;
    return failOn === 'warning' && counts.warnings ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    const { options, files } = parseArgs(process.argv.slice(2));
    const result = countFinish(files, options);
    const code = exitCodeFor(result.counts, options.failOn);
    if (options.json) {
        console.log(JSON.stringify({ ...result, exitCode: code }, null, 2));
    } else {
        for (const item of result.findings) console.log(`${item.file}:${item.line}:${item.column} [${item.severity}] ${item.rule}: ${item.message}`);
        console.log(`files ${result.counts.scannedFiles} | errors ${result.counts.errors} | warnings ${result.counts.warnings} | accent hues ${result.counts.accentHues.length} (${result.counts.accentHues.join(', ') || 'none'}) | radii ${result.counts.radii.join(', ') || 'none'}`);
    }
    process.exitCode = code;
}
