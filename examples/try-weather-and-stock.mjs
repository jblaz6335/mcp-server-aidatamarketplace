import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Free contract previews only: no wallet, signing, or payments.
const cases = [
  { query: 'weather forecast city current weather', operation: 'weather_forecast', inputs: { city: 'San Francisco', days: 2 } },
  { query: 'public company stock research SEC filings', operation: 'stock_research_brief', inputs: { symbol: 'AAPL' } }
];
const parse = result => {
  assert.notEqual(result.isError, true, JSON.stringify(result));
  const text = result.content.find(item => item.type === 'text')?.text;
  assert.ok(text, 'The MCP tool returned no text payload.');
  return JSON.parse(text);
};
const client = new Client({ name: 'dopaminedesk-weather-stock-demo', version: '1.0.0' });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [fileURLToPath(new URL('../index.js', import.meta.url))],
  env: { X402_TOOL_MODE: 'compact', X402_AUTO_PAY: 'false' },
  stderr: 'pipe'
});
try {
  await client.connect(transport);
  for (const item of cases) {
    const found = parse(await client.callTool({ name: 'find_marketplace_products', arguments: { query: item.query } }));
    const match = found.products?.find(product => product.operation_id === item.operation);
    assert.ok(match, `${item.operation} was not returned for ${item.query}`);
    const preview = parse(await client.callTool({ name: 'purchase_marketplace_product', arguments: { operation_id: item.operation, inputs: item.inputs, preview: true } }));
    assert.equal(preview.http_status, 200, JSON.stringify(preview));
    assert.equal(preview.payment_response_header, null);
    console.log(JSON.stringify({ product: item.operation, price_usdc: match.price_usdc, preview_status: preview.http_status, payment_made: false }));
  }
} finally { await client.close(); }
