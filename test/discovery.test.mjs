import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCT_SEARCH_TOOL,
  addRecommendedPurchasePath,
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

test('queries a short ranked capability feed and returns a ready preview path', async () => {
  let observed;
  const httpClient = {
    async get(url, options) {
      observed = { url, options };
      return { data: { products: [{
        operation_id: 'vendor_risk_report',
        name: 'Vendor Risk Report',
        description: 'Return a decision-ready vendor risk report.',
        use_when: 'Assess a vendor before onboarding.',
        price_usdc: '0.025',
        source: 'live public sources',
        freshness: 'live_upstream_on_request',
        preview_url: 'https://example.com/preview',
        input_parameters: [{ name: 'domain', required: true }],
        example_request: { domain: 'example.com' }
      }] } };
    }
  };
  const result = await searchMarketplaceProducts(httpClient, 'https://example.com/', ' vendor risk ');
  assert.equal(observed.url, 'https://example.com/.well-known/agent-capabilities.json');
  assert.deepEqual(observed.options.params, { q: 'vendor risk', limit: 3 });
  assert.equal(observed.options.timeout, 15_000);
  assert.equal(result.recommended_purchase.operation_id, 'vendor_risk_report');
  assert.equal(result.recommended_purchase.price_usdc, '0.025');
  assert.deepEqual(result.recommended_purchase.required_inputs, ['domain']);
  assert.deepEqual(result.recommended_purchase.preview_call, {
    tool: 'purchase_marketplace_product',
    arguments: {
      operation_id: 'vendor_risk_report',
      inputs: { domain: 'example.com' },
      preview: true
    },
    requires_payment: false
  });
  assert.equal(result.recommended_purchase.paid_call.requires_payment, true);
  assert.equal(JSON.stringify(observed).includes('payment'), false);
});

test('handles an empty result without inventing a purchase', () => {
  const result = addRecommendedPurchasePath({ products: [] });
  assert.equal(result.recommended_purchase, null);
  assert.match(result.next_step, /Refine the query/);
});
