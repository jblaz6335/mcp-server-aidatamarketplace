const TRANSPORT_FIELDS = Object.freeze([
  'preview',
  'auto_pay',
  'payment_signature',
  'tx_hash',
  'payment_id',
  'agent_token'
]);

export const PURCHASE_PRODUCT_TOOL = Object.freeze({
  name: 'purchase_marketplace_product',
  description: 'Use after find_marketplace_products. Preview or purchase the selected paid product by its operation_id, without searching through the full dynamic tool list.',
  inputSchema: {
    type: 'object',
    properties: {
      operation_id: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
        description: 'Exact operation_id returned by find_marketplace_products, such as evm_receipt or vendor_risk_report.'
      },
      inputs: {
        type: 'object',
        description: 'Product-specific inputs returned in input_parameters or example_request by find_marketplace_products.',
        additionalProperties: true
      },
      preview: { type: 'boolean', description: 'Inspect the live contract proof before paying.' },
      auto_pay: { type: 'boolean', description: 'Pay automatically with the locally configured, explicitly enabled buyer wallet.' },
      payment_signature: { type: 'string', description: 'Base64 x402 v2 PAYMENT-SIGNATURE from a compatible buyer client.' },
      tx_hash: { type: 'string', description: 'Base transaction hash after paying an x402 invoice.' },
      payment_id: { type: 'string', description: 'payment_id returned by the x402 invoice.' },
      agent_token: { type: 'string', description: 'Optional pre-funded marketplace bearer token.' }
    },
    required: ['operation_id', 'inputs'],
    additionalProperties: false
  }
});

export function normalizePurchaseRequest(value = {}) {
  const operationId = String(value.operation_id || '').trim();
  if (!/^[a-z0-9_]{2,100}$/.test(operationId)) {
    throw new Error('operation_id must be a 2-100 character lowercase catalog identifier.');
  }
  const inputs = value.inputs ?? {};
  if (!inputs || typeof inputs !== 'object' || Array.isArray(inputs)) {
    throw new Error('inputs must be an object.');
  }
  for (const field of TRANSPORT_FIELDS) {
    if (Object.hasOwn(inputs, field)) {
      throw new Error(`${field} is a transport field and must be supplied at the top level.`);
    }
  }
  const routeArguments = { ...inputs };
  for (const field of TRANSPORT_FIELDS) {
    if (value[field] !== undefined) routeArguments[field] = value[field];
  }
  return { operationId, routeArguments };
}
