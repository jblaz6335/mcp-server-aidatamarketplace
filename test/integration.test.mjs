import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const operationId = 'audit-website-ai-search-visibility-agent-readiness';
const endpointPath = `/api/v1/${operationId}`;
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const operation = {
  operationId, description: 'Fixture audit', 'x-billable': true, 'x-availability': 'operational',
  'x-price-usdc': '0.025', 'x-data-mode': 'live_source',
  parameters: [{ name: 'domain', required: true, schema: { type: 'string' } }]
};

for (const mode of ['compact', 'full']) {
  test(`${mode} stdio client discovers, previews a hyphenated product, and refuses auto-pay`, { timeout: 20000 }, async () => {
    const requests = [];
    const fixture = createServer((req, res) => {
      requests.push({ url: req.url, method: req.method, signature: req.headers['payment-signature'] });
      res.setHeader('content-type', 'application/json');
      if (req.url === '/openapi.json') return res.end(JSON.stringify({ paths: { [endpointPath]: { get: operation } } }));
      if (req.url.startsWith('/.well-known/agent-capabilities.json')) return res.end(JSON.stringify({ products: [{
        operation_id: operationId, name: 'Fixture audit', price_usdc: '0.025',
        example_request: { domain: 'example.com' }, preview_url: `${endpointPath}?preview=true`,
        input_parameters: [{ name: 'domain', required: true }]
      }] }));
      if (req.url.startsWith(endpointPath) && new URL(req.url, 'http://fixture').searchParams.get('preview') === 'true') {
        return res.end(JSON.stringify({ success: true, live_proof: { fixture: true } }));
      }
      res.statusCode = 402;
      res.end(JSON.stringify({ error: 'Unpaid fixture request' }));
    });
    await new Promise(resolve => fixture.listen(0, '127.0.0.1', resolve));
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [fileURLToPath(new URL('../index.js', import.meta.url))],
      env: {
        MARKETPLACE_URL: `http://127.0.0.1:${fixture.address().port}/`,
        X402_AUTO_PAY: 'false', X402_TOOL_MODE: mode
      }, stderr: 'pipe'
    });
    const client = new Client({ name: 'integration-test', version: '1.0.0' });
    try {
      await client.connect(transport);
      assert.equal(client.getServerVersion().version, packageJson.version);
      const listed = await client.listTools();
      assert.equal(listed.tools.length, mode === 'compact' ? 2 : 3);
      if (mode === 'compact') assert.equal(requests.length, 0);
      const found = await client.callTool({ name: 'find_marketplace_products', arguments: { query: 'audit website' } });
      assert.notEqual(found.isError, true);
      const recommendation = JSON.parse(found.content[0].text).recommended_purchase;
      assert.equal(recommendation.operation_id, operationId);
      const preview = await client.callTool({
        name: 'purchase_marketplace_product',
        arguments: { operation_id: operationId, inputs: { domain: 'example.com' }, preview: true }
      });
      assert.notEqual(preview.isError, true);
      assert.equal(JSON.parse(preview.content[0].text).http_status, 200);
      const beforeRefusal = requests.length;
      const refused = await client.callTool({
        name: 'purchase_marketplace_product',
        arguments: { operation_id: operationId, inputs: { domain: 'example.com' }, auto_pay: true }
      });
      assert.equal(refused.isError, true);
      assert.match(refused.content[0].text, /disabled/);
      assert.equal(requests.length, beforeRefusal);
      assert.ok(requests.every(request => !request.signature));
      assert.ok(requests.filter(request => request.url.startsWith('/api/v1/')).every(request => request.url.includes('preview=true')));
    } finally {
      await client.close();
      fixture.closeAllConnections();
      await new Promise(resolve => fixture.close(resolve));
    }
  });
}
