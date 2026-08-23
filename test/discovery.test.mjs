import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCT_SEARCH_TOOL,
  normalizeProductSearchQuery,
  searchMarketplaceProducts
} from '../discovery.js';

test('declares a free task-to-product discovery tool with a required query', () => {
  assert.equal(PRODUCT_SEARCH_TOOL.name, 'find_marketplace_products');
  assert.deepEqual(PRODUCT_SEARCH_TOOL.inputSchema.required, ['query']);
  assert.equal(PRODUCT_SEARCH_TOOL.inputSchema.properties.query.minLength, 2);
  assert.equal(PRODUCT_SEARCH_TOOL.inputSchema.properties.query.maxLength, 200);
});

test('normalizes buyer intent and rejects unusable queries', () => {
  assert.equal(normalizeProductSearchQuery('  verify   a vendor  '), 'verify a vendor');
  assert.throws(() => normalizeProductSearchQuery('x'), /between 2 and 200/);
  assert.throws(() => normalizeProductSearchQuery('x'.repeat(201)), /between 2 and 200/);
});

test('queries the public ranked capability feed without payment fields', async () => {
  let observed;
  const httpClient = {
    async get(url, options) {
      observed = { url, options };
      return { data: { products: [{ operation_id: 'vendor_risk_report' }] } };
    }
  };
  const result = await searchMarketplaceProducts(httpClient, 'https://example.com/', ' vendor risk ');
  assert.equal(observed.url, 'https://example.com/.well-known/agent-capabilities.json');
  assert.deepEqual(observed.options.params, { q: 'vendor risk' });
  assert.equal(observed.options.timeout, 15_000);
  assert.deepEqual(result, { products: [{ operation_id: 'vendor_risk_report' }] });
  assert.equal(JSON.stringify(observed).includes('payment'), false);
});
