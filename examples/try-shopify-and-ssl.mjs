import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Two real, free production previews. This process never signs or pays.
const cases = [
  {
    task: 'live public Shopify catalog product availability',
    operationId: 'shopify_store_lookup',
    inputs: { domain: 'smallcrewmerch.com' }
  },
  {
    task: 'live TLS certificate validity',
    operationId: 'ssl_certificate',
    inputs: { domain: 'example.com' }
  }
];

function readToolResult(result) {
  assert.notEqual(result.isError, true, JSON.stringify(result));
  const text = result.content.find(item => item.type === 'text')?.text;
  assert.ok(text, 'The MCP tool returned no text payload.');
  return JSON.parse(text);
}

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [fileURLToPath(new URL('../index.js', import.meta.url))],
  env: { X402_TOOL_MODE: 'compact', X402_AUTO_PAY: 'false' },
  stderr: 'pipe'
});
const client = new Client({ name: 'dopaminedesk-free-buyer-demos', version: '1.0.0' });

try {
  await client.connect(transport);
  const output = [];
  for (const example of cases) {
    const found = readToolResult(await client.callTool({
      name: 'find_marketplace_products',
      arguments: { query: example.task }
    }));
    assert.equal(found.products?.[0]?.operation_id, example.operationId,
      `The task no longer ranks ${example.operationId} first.`);
    const preview = readToolResult(await client.callTool({
      name: 'purchase_marketplace_product',
      arguments: { operation_id: example.operationId, inputs: example.inputs, preview: true }
    }));
    assert.equal(preview.http_status, 200, JSON.stringify(preview));
    assert.equal(preview.payment_response_header, null);
    output.push({
      task: example.task,
      product: example.operationId,
      price_usdc: found.products[0].price_usdc,
      preview_http_status: preview.http_status,
      payment_made: false
    });
  }
  console.log(JSON.stringify({ tools: 2, examples: output }, null, 2));
} finally {
  await client.close();
}
