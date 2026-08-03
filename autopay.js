import { x402Client, wrapFetchWithPayment } from '@x402/fetch';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { privateKeyToAccount } from 'viem/accounts';

export function createAutoPayRuntime(env = process.env, fetchImpl = globalThis.fetch) {
  const enabled = /^(1|true|yes)$/i.test(env.X402_AUTO_PAY || '');
  const maxPaymentUsdc = Number(env.X402_MAX_PAYMENT_USDC || '0.25');
  const runtime = { enabled, maxPaymentUsdc, fetchWithPayment: null, error: null };
  if (!enabled) return runtime;

  const rawKey = String(env.X402_EVM_PRIVATE_KEY || env.EVM_PRIVATE_KEY || '').trim();
  const privateKey = rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`;
  if (!/^0x[0-9a-f]{64}$/i.test(privateKey)) {
    runtime.error = 'X402_EVM_PRIVATE_KEY is missing or invalid.';
    return runtime;
  }
  if (!Number.isFinite(maxPaymentUsdc) || maxPaymentUsdc <= 0) {
    runtime.error = 'X402_MAX_PAYMENT_USDC must be a positive number.';
    return runtime;
  }

  const client = new x402Client();
  registerExactEvmScheme(client, { signer: privateKeyToAccount(privateKey) });
  runtime.fetchWithPayment = wrapFetchWithPayment(fetchImpl, client);
  return runtime;
}

export function assertAutoPayAllowed(runtime, priceUsdc, hasConflictingInput = false) {
  if (hasConflictingInput) {
    throw new Error('auto_pay cannot be combined with preview, payment_signature, tx_hash, or agent_token.');
  }
  if (!runtime.enabled) {
    throw new Error('Auto-pay is disabled. Set X402_AUTO_PAY=true in this MCP server configuration.');
  }
  if (!runtime.fetchWithPayment) {
    throw new Error(`Auto-pay has no valid local buyer wallet. ${runtime.error || 'Set X402_EVM_PRIVATE_KEY to a dedicated funded Base wallet.'}`);
  }
  if (!Number.isFinite(priceUsdc) || priceUsdc > runtime.maxPaymentUsdc) {
    throw new Error(`Refusing ${priceUsdc} USDC purchase because it exceeds X402_MAX_PAYMENT_USDC=${runtime.maxPaymentUsdc}.`);
  }
}
