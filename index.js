#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { assertAutoPayAllowed, createAutoPayRuntime } from './autopay.js';

const ORIGIN = process.env.MARKETPLACE_URL || 'https://ai-data-marketplace-1042299154756.us-central1.run.app';
const server = new Server({ name: 'dopaminedesk-ai-data-marketplace', version: '2.8.0' }, { capabilities: { tools: {} } });
const CACHE_TTL_MS = 5 * 60 * 1000;
let catalogCache = null;
let catalogCachedAt = 0;
const autoPayRuntime = createAutoPayRuntime();
if (autoPayRuntime.error) console.error(`x402 auto-pay unavailable: ${autoPayRuntime.error} Auto-pay calls will be refused.`);

function toolName(method, endpointPath) {
  const slug = endpointPath.replace(/^\/api\/v1\//, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  return method === 'GET' ? `get_${slug}` : slug;
}

function transportFields() {
    return {
        preview: { type: 'boolean', description: 'Use the rate-limited free preview without payment.' },
        auto_pay: { type: 'boolean', description: 'Automatically authorize and pay this request with the locally configured buyer wallet. Requires X402_AUTO_PAY=true and X402_EVM_PRIVATE_KEY.' },
        payment_signature: { type: 'string', description: 'Base64 x402 v2 PAYMENT-SIGNATURE produced by a compatible buyer client.' },
        tx_hash: { type: 'string', description: 'Base transaction hash after paying an x402 invoice.' },
    payment_id: { type: 'string', description: 'payment_id returned by the x402 invoice.' },
    agent_token: { type: 'string', description: 'Optional pre-funded marketplace bearer token.' }
  };
}

async function loadCatalog() {
  if (catalogCache && Date.now() - catalogCachedAt < CACHE_TTL_MS) return catalogCache;
  const response = await axios.get(`${ORIGIN}/openapi.json`, { timeout: 15_000 });
  const paths = response.data?.paths || {};
  const tools = [];
  const byName = new Map();

  for (const [endpointPath, methods] of Object.entries(paths)) {
    for (const [methodLower, operation] of Object.entries(methods)) {
      const method = methodLower.toUpperCase();
      if (!['GET', 'POST'].includes(method) || operation['x-billable'] !== true || operation['x-availability'] !== 'operational') continue;
      const baseProperties = method === 'GET'
        ? Object.fromEntries((operation.parameters || []).map(parameter => [parameter.name, parameter.schema || { type: 'string' }]))
        : operation.requestBody?.content?.['application/json']?.schema?.properties || {};
      const required = method === 'GET'
        ? (operation.parameters || []).filter(parameter => parameter.required).map(parameter => parameter.name)
        : operation.requestBody?.content?.['application/json']?.schema?.required || [];
      const name = toolName(method, endpointPath);
      const descriptor = {
        name,
        description: `${operation.description} Price: ${operation['x-price-usdc']} USDC. Mode: ${operation['x-data-mode']}. Source: ${operation['x-source'] || 'declared in response'}. Set auto_pay=true for a one-call purchase when the local buyer wallet is configured.`,
        inputSchema: { type: 'object', properties: { ...baseProperties, ...transportFields() }, required },
        _route: { method, endpointPath, priceUsdc: Number(operation['x-price-usdc']) }
      };
      tools.push(descriptor);
      byName.set(name, descriptor);
    }
  }

  catalogCache = { tools, byName };
  catalogCachedAt = Date.now();
  return catalogCache;
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const catalog = await loadCatalog();
  return { tools: catalog.tools.map(({ _route, ...tool }) => tool) };
});

server.setRequestHandler(CallToolRequestSchema, async request => {
  try {
    const catalog = await loadCatalog();
    const descriptor = catalog.byName.get(request.params.name);
    if (!descriptor) throw new Error(`Unknown or currently non-billable tool: ${request.params.name}`);

    const args = { ...(request.params.arguments || {}) };
    const paymentSignature = args.payment_signature;
    const txHash = args.tx_hash;
    const paymentId = args.payment_id;
    const agentToken = args.agent_token;
    const preview = args.preview === true;
    const autoPay = args.auto_pay === true;
    delete args.payment_signature;
    delete args.tx_hash;
    delete args.payment_id;
    delete args.agent_token;
    delete args.preview;
    delete args.auto_pay;

    if (txHash && !paymentId) throw new Error('payment_id is required with tx_hash. Use the payment_id returned by the 402 invoice.');
    if (autoPay && (preview || paymentSignature || txHash || agentToken)) {
      throw new Error('auto_pay cannot be combined with preview, payment_signature, tx_hash, or agent_token.');
    }
    if (autoPay) {
      assertAutoPayAllowed(autoPayRuntime, descriptor._route.priceUsdc, preview || paymentSignature || txHash || agentToken);
    }
    const headers = {};
    if (paymentSignature) headers['payment-signature'] = paymentSignature;
    if (txHash) {
      headers['x-402-payment-tx'] = txHash;
      headers['x-402-payment-id'] = paymentId;
    }
    if (agentToken) headers.authorization = `Bearer ${agentToken}`;

    const url = new URL(`${ORIGIN}${descriptor._route.endpointPath}`);
    let data;
    if (preview) url.searchParams.set('preview', 'true');
    if (descriptor._route.method === 'GET') {
      for (const [key, value] of Object.entries(args)) {
        if (value == null) continue;
        url.searchParams.set(key, Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    } else {
      data = args;
      headers['content-type'] = 'application/json';
    }

    let response;
    if (autoPay) {
      const nativeResponse = await autoPayRuntime.fetchWithPayment(url, {
        method: descriptor._route.method,
        headers,
        body: data === undefined ? undefined : JSON.stringify(data),
        signal: AbortSignal.timeout(30_000)
      });
      const rawBody = await nativeResponse.text();
      let parsedBody;
      try { parsedBody = JSON.parse(rawBody); } catch { parsedBody = { raw_body: rawBody.slice(0, 10_000) }; }
      response = {
        status: nativeResponse.status,
        data: parsedBody,
        headers: Object.fromEntries(nativeResponse.headers.entries())
      };
    } else {
      response = await axios({
        method: descriptor._route.method,
        url: url.toString(),
        data,
        headers,
        timeout: 30_000,
        validateStatus: () => true
      });
    }
    const paymentRequired = response.headers['payment-required'];
    const paymentResponse = response.headers['payment-response'];
    let decodedPaymentRequired = null;
    if (paymentRequired) {
      try {
        decodedPaymentRequired = JSON.parse(Buffer.from(paymentRequired, 'base64').toString('utf8'));
      } catch {
        decodedPaymentRequired = null;
      }
    }
    return {
      isError: response.status >= 400 && (autoPay || response.status !== 402),
      content: [{ type: 'text', text: JSON.stringify({
        http_status: response.status,
        payment_required: decodedPaymentRequired,
        payment_required_header: paymentRequired || null,
        payment_response_header: paymentResponse || null,
        ...response.data
      }, null, 2) }]
    };
  } catch (error) {
    return { isError: true, content: [{ type: 'text', text: `Error: ${error.message}` }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
