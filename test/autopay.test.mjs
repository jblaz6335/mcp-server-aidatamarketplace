import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { assertAutoPayAllowed, createAutoPayRuntime } from '../autopay.js';

const TEST_KEY = `0x${'11'.repeat(32)}`;
const PAY_TO = '0x2222222222222222222222222222222222222222';
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

test('refuses disabled, invalid, conflicting, and over-cap purchases', () => {
  assert.throws(() => assertAutoPayAllowed(createAutoPayRuntime({}, fetch), 0.01), /disabled/);
  const invalid = createAutoPayRuntime({ X402_AUTO_PAY: 'true', X402_EVM_PRIVATE_KEY: 'bad' }, fetch);
  assert.throws(() => assertAutoPayAllowed(invalid, 0.01), /missing or invalid/);
  const valid = createAutoPayRuntime({
    X402_AUTO_PAY: 'true',
    X402_EVM_PRIVATE_KEY: TEST_KEY,
    X402_MAX_PAYMENT_USDC: '0.05'
  }, fetch);
  assert.throws(() => assertAutoPayAllowed(valid, 0.10), /exceeds/);
  assert.throws(() => assertAutoPayAllowed(valid, 0.01, true), /cannot be combined/);
});

test('signs a v2 Base challenge locally and retries with PAYMENT-SIGNATURE', async () => {
  let requests = 0;
  let paymentSignature = null;
  const server = createServer((req, res) => {
    requests += 1;
    paymentSignature = req.headers['payment-signature'] || null;
    if (paymentSignature) {
      res.writeHead(200, { 'content-type': 'application/json', 'payment-response': 'test-settlement' });
      res.end(JSON.stringify({ success: true }));
      return;
    }
    const port = server.address().port;
    const challenge = {
      x402Version: 2,
      resource: { url: `http://127.0.0.1:${port}/paid`, description: 'test product', mimeType: 'application/json' },
      accepts: [{
        scheme: 'exact', network: 'eip155:8453', amount: '10000', asset: USDC,
        payTo: PAY_TO, maxTimeoutSeconds: 300, extra: { name: 'USD Coin', version: '2' }
      }]
    };
    res.writeHead(402, {
      'content-type': 'application/json',
      'payment-required': Buffer.from(JSON.stringify(challenge)).toString('base64')
    });
    res.end(JSON.stringify({ error: 'Payment Required' }));
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const runtime = createAutoPayRuntime({
      X402_AUTO_PAY: 'true', X402_EVM_PRIVATE_KEY: TEST_KEY, X402_MAX_PAYMENT_USDC: '0.05'
    }, fetch);
    assertAutoPayAllowed(runtime, 0.01);
    const response = await runtime.fetchWithPayment(`http://127.0.0.1:${server.address().port}/paid`);
    assert.equal(response.status, 200);
    assert.equal(requests, 2);
    assert.ok(paymentSignature);
    const payload = JSON.parse(Buffer.from(paymentSignature, 'base64').toString('utf8'));
    assert.equal(payload.x402Version, 2);
    assert.equal(payload.accepted.network, 'eip155:8453');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
