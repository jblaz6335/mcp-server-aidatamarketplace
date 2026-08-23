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

export async function searchMarketplaceProducts(httpClient, origin, value) {
  const query = normalizeProductSearchQuery(value);
  const response = await httpClient.get(`${origin.replace(/\/$/, '')}/.well-known/agent-capabilities.json`, {
    params: { q: query },
    timeout: 15_000
  });
  return response.data;
}
