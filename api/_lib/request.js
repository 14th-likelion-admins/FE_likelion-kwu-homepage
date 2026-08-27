import { timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { env } from 'node:process';

export function sendJson(response, status, body) {
  response.status(status).json(body);
}

export function requireMethod(request, response, method) {
  if (request.method === method) return true;
  response.setHeader('Allow', method);
  sendJson(response, 405, { success: false, message: '허용되지 않은 요청 방식입니다.' });
  return false;
}

export function hasValidPassphrase(passphrase) {
  const expected = env.CONTENT_WRITE_PASSPHRASE;
  if (typeof passphrase !== 'string' || !expected) return false;

  const givenBuffer = Buffer.from(passphrase);
  const expectedBuffer = Buffer.from(expected);
  return givenBuffer.length === expectedBuffer.length && timingSafeEqual(givenBuffer, expectedBuffer);
}

export function requirePassphrase(response, passphrase) {
  if (hasValidPassphrase(passphrase)) return true;
  sendJson(response, 401, { success: false, message: '암호가 올바르지 않습니다.' });
  return false;
}

export async function readJsonBody(request) {
  if (request.body && typeof request.body === 'object' && !Buffer.isBuffer(request.body)) {
    return request.body;
  }

  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export async function readRequestBuffer(request, maxBytes) {
  const contentLength = Number(request.headers['content-length']);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    const error = new Error('REQUEST_TOO_LARGE');
    error.code = 'REQUEST_TOO_LARGE';
    throw error;
  }

  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    length += buffer.length;
    if (length > maxBytes) {
      const error = new Error('REQUEST_TOO_LARGE');
      error.code = 'REQUEST_TOO_LARGE';
      throw error;
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}
