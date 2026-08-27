import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [fileURLToPath(new URL('../index.js', import.meta.url))],
  env: { X402_TOOL_MODE: 'compact', X402_AUTO_PAY: 'false' },
  stderr: 'pipe'
});
const client = new Client({ name: 'dopaminedesk-free-integration-check', version: '1.0.0' });
function payload(result) {
  assert.notEqual(result.isError, true, JSON.stringify(result));
  return JSON.parse(result.content.find(item => item.type === 'text').text);
}
try {
  await client.connect(transport);
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map(tool => tool.name), ['find_marketplace_products', 'purchase_marketplace_product']);
  const found = payload(await client.callTool({
    name: 'find_marketplace_products', arguments: { query: 'website due diligence counterparty domain check' }
  }));
  const choice = found.recommended_purchase;
  assert.ok(choice?.operation_id && choice.preview_call, 'No previewable product matched.');
  const preview = payload(await client.callTool({
    name: 'purchase_marketplace_product',
    arguments: { operation_id: choice.operation_id, inputs: { domain: 'example.com' }, preview: true }
  }));
  assert.equal(preview.http_status, 200, JSON.stringify(preview));
  assert.equal(preview.payment_response_header, null);
  console.log(JSON.stringify({
    server: client.getServerVersion(), tools: tools.map(tool => tool.name),
    operation_id: choice.operation_id, price_usdc: choice.price_usdc,
    preview_http_status: preview.http_status, payment_made: false
  }, null, 2));
} finally {
  await client.close();
}
