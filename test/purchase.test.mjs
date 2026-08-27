import test from 'node:test';
import assert from 'node:assert/strict';
import { PURCHASE_PRODUCT_TOOL, normalizePurchaseRequest } from '../purchase.js';

test('declares a discovery-to-purchase tool with bounded operation input', () => {
  assert.equal(PURCHASE_PRODUCT_TOOL.name, 'purchase_marketplace_product');
  assert.deepEqual(PURCHASE_PRODUCT_TOOL.inputSchema.required, ['operation_id', 'inputs']);
  assert.equal(PURCHASE_PRODUCT_TOOL.inputSchema.properties.operation_id.maxLength, 100);
});

test('maps product inputs and top-level payment transport into route arguments', () => {
  assert.deepEqual(normalizePurchaseRequest({
    operation_id: 'evm_receipt',
    inputs: { chain: 'base', transaction_hash: '0xabc' },
    preview: true
  }), {
    operationId: 'evm_receipt',
    routeArguments: { chain: 'base', transaction_hash: '0xabc', preview: true }
  });
});

test('rejects unknown identifier shapes, non-object inputs, and hidden payment fields', () => {
  assert.throws(() => normalizePurchaseRequest({ operation_id: '../receipt', inputs: {} }), /operation_id/);
  assert.throws(() => normalizePurchaseRequest({ operation_id: 'evm_receipt', inputs: [] }), /inputs must be an object/);
  assert.throws(() => normalizePurchaseRequest({ operation_id: 'evm_receipt', inputs: { auto_pay: true } }), /top level/);
});

test('accepts the live hyphenated audit identifier without accepting paths or URLs', () => {
  const operation_id = 'audit-website-ai-search-visibility-agent-readiness';
  assert.equal(normalizePurchaseRequest({ operation_id, inputs: {}, preview: true }).operationId, operation_id);
  for (const invalid of ['https://example.com', '../audit', 'audit?auto_pay=true', 'AUDIT']) {
    assert.throws(() => normalizePurchaseRequest({ operation_id: invalid, inputs: {} }), /operation_id/);
  }
});
