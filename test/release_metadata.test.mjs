import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const lockJson = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
const serverJson = JSON.parse(await readFile(new URL('../server.json', import.meta.url), 'utf8'));
const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
const installGuide = await readFile(new URL('../llms-install.md', import.meta.url), 'utf8');
const bundleManifest = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
const clientExample = JSON.parse(await readFile(new URL('../examples/mcp-client.json', import.meta.url), 'utf8'));
const vscodeExample = JSON.parse(await readFile(new URL('../examples/vscode-mcp.json', import.meta.url), 'utf8'));

test('release metadata stays synchronized', () => {
  assert.equal(lockJson.version, packageJson.version);
  assert.equal(lockJson.packages[''].version, packageJson.version);
  assert.equal(serverJson.version, packageJson.version);
  assert.equal(serverJson.packages[0].version, packageJson.version);
  assert.equal(bundleManifest.version, packageJson.version);
});

test('published package contains every README-linked install document', () => {
  assert.ok(packageJson.files.includes('README.md'));
  assert.ok(packageJson.files.includes('llms-install.md'));
  assert.ok(packageJson.files.includes('PAYMENT_FLOW.md'));
  assert.ok(packageJson.files.includes('examples'));
});

test('integration examples pin this release and disable payment by default', () => {
  for (const config of [clientExample.mcpServers.dopaminedesk, vscodeExample.servers.dopaminedesk]) {
    assert.equal(config.command, 'npx');
    assert.deepEqual(config.args, ['-y', `${packageJson.name}@${packageJson.version}`]);
    assert.equal(config.env.X402_TOOL_MODE, 'compact');
    assert.equal(config.env.X402_AUTO_PAY, 'false');
    assert.equal(config.env.X402_EVM_PRIVATE_KEY, undefined);
  }
});

test('Docker context is restricted to runtime sources and dependency manifests', async () => {
  const dockerfile = await readFile(new URL('../Dockerfile', import.meta.url), 'utf8');
  const ignore = await readFile(new URL('../.dockerignore', import.meta.url), 'utf8');
  assert.match(ignore, /^\*\*\r?\n/, 'the first Docker ignore rule must exclude everything on LF and CRLF checkouts');
  assert.ok(!dockerfile.includes('COPY . .'));
  assert.ok(dockerfile.includes('COPY index.js autopay.js discovery.js purchase.js ./'));
});

test('buyer install examples never pin an older package version', () => {
  const pins = [...`${readme}\n${installGuide}`.matchAll(/dopaminedesk-ai-data-marketplace-mcp@(\d+\.\d+\.\d+)/g)]
    .map(match => match[1]);
  assert.ok(pins.length > 0);
  assert.deepEqual([...new Set(pins)], [packageJson.version]);
});
