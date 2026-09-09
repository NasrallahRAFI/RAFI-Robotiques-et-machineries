import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const htmlFiles = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', '.agents', '.codex'].includes(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(fullPath);
  }
}

function fail(file, message) {
  failures.push(`${path.relative(root, file)}: ${message}`);
}

function checkLocalReference(file, value, kind) {
  if (!value || /^(#|data:|mailto:|tel:|https?:|javascript:)/i.test(value)) return;
  const cleanValue = value.split('#')[0].split('?')[0];
  if (!cleanValue) return;
  const resolved = cleanValue.startsWith('/')
    ? path.resolve(root, `.${cleanValue}`)
    : path.resolve(path.dirname(file), cleanValue);
  const candidates = [resolved, `${resolved}.html`, path.join(resolved, 'index.html')];
  if (!candidates.some((candidate) => fs.existsSync(candidate))) {
    fail(file, `broken local ${kind} reference: ${value}`);
  }
}

walk(root);
for (const file of htmlFiles) {
  const source = fs.readFileSync(file, 'utf8');
  if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(source)) fail(file, 'missing html lang attribute');
  if (!/<title>\s*[^<]+\s*<\/title>/i.test(source)) fail(file, 'missing or empty title');
  if ((source.match(/<h1\b/gi) || []).length !== 1) fail(file, 'expected exactly one h1');

  for (const match of source.matchAll(/<(?:a|link|script|img)\b[^>]*(?:href|src)=["']([^"']+)["'][^>]*>/gi)) {
    const kind = match[0].startsWith('<img') ? 'asset' : 'link';
    checkLocalReference(file, match[1], kind);
  }

  for (const match of source.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt=["'][^"']*["']/i.test(match[1])) fail(file, 'image missing alt attribute');
  }
}

if (failures.length) {
  console.error(`Site check failed with ${failures.length} issue(s):`);
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Site check passed: ${htmlFiles.length} HTML pages, local references and core metadata verified.`);
}
