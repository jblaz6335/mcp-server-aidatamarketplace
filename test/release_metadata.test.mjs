import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const lockJson = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
const serverJson = JSON.parse(await readFile(new URL('../server.json', import.meta.url), 'utf8'));

test('release metadata stays synchronized', () => {
  assert.equal(lockJson.version, packageJson.version);
  assert.equal(lockJson.packages[''].version, packageJson.version);
  assert.equal(serverJson.version, packageJson.version);
  assert.equal(serverJson.packages[0].version, packageJson.version);
});

test('published package contains every README-linked install document', () => {
  assert.ok(packageJson.files.includes('README.md'));
  assert.ok(packageJson.files.includes('llms-install.md'));
  assert.ok(packageJson.files.includes('PAYMENT_FLOW.md'));
});
