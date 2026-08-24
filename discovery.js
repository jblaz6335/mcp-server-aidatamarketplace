export const PRODUCT_SEARCH_TOOL = Object.freeze({
  name: 'find_marketplace_products',
  description: 'Free discovery tool. Rank the live DopamineDesk x402 catalog against a plain-language buyer task before choosing or paying for a product.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        minLength: 2,
        maxLength: 200,
        description: 'Plain-language task or desired outcome, such as "verify a vendor before onboarding" or "check a Base transaction receipt".'
      }
    },
    required: ['query']
  }
});

export function normalizeProductSearchQuery(value) {
  const query = String(value || '').replace(/\s+/g, ' ').trim();
  if (query.length < 2 || query.length > 200) {
    throw new Error('query must contain between 2 and 200 characters.');
  }
  return query;
}

function copyInputs(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return { ...value };
}

export function addRecommendedPurchasePath(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data;
  const products = Array.isArray(data.products) ? data.products : [];
  const product = products[0];
  if (!product || typeof product !== 'object' || !product.operation_id) {
    return {
      ...data,
      recommended_purchase: null,
      next_step: 'Refine the query. No matching paid product was returned.'
    };
  }

  const inputs = copyInputs(product.example_request);
  const baseArguments = {
    operation_id: product.operation_id,
    inputs
  };
  const requiredInputs = Array.isArray(product.input_parameters)
    ? product.input_parameters.filter(input => input?.required === true).map(input => input.name).filter(Boolean)
    : [];

  return {
    ...data,
    recommended_purchase: {
      operation_id: product.operation_id,
      name: product.name,
      why: product.use_when || product.description,
      paid_outcome: product.description,
      price_usdc: product.price_usdc,
      source: product.source,
      freshness: product.freshness,
      required_inputs: requiredInputs,
      inputs_are_examples: true,
      instruction: 'Replace example inputs with the buyer\'s real values. Preview first when available. Only make the paid call after the user authorizes the listed price and payment method.',
      preview_call: product.preview_url ? {
        tool: 'purchase_marketplace_product',
        arguments: { ...baseArguments, preview: true },
        requires_payment: false
      } : null,
      paid_call: {
        tool: 'purchase_marketplace_product',
        arguments: baseArguments,
        requires_payment: true
      }
    },
    next_step: product.preview_url
      ? 'Fill the buyer\'s real inputs and run recommended_purchase.preview_call.'
      : 'Fill the buyer\'s real inputs, confirm payment, and run recommended_purchase.paid_call.'
  };
}

export async function searchMarketplaceProducts(httpClient, origin, value) {
  const query = normalizeProductSearchQuery(value);
  const response = await httpClient.get(`${origin.replace(/\/$/, '')}/.well-known/agent-capabilities.json`, {
    params: { q: query, limit: 3 },
    timeout: 15_000
  });
  return addRecommendedPurchasePath(response.data);
}
