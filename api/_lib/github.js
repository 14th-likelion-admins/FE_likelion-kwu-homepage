import { Buffer } from 'node:buffer';
import { createSign } from 'node:crypto';
import { env } from 'node:process';

const API_BASE_URL = 'https://api.github.com';

function getRepository() {
  const repository = env.GITHUB_REPO;
  if (!repository) {
    throw new Error('GITHUB_REPO 환경변수가 설정되지 않았습니다.');
  }

  const [owner, repo, ...rest] = repository.split('/');
  if (!owner || !repo || rest.length > 0) {
    throw new Error('GITHUB_REPO는 "owner/repository" 형식이어야 합니다.');
  }

  return { owner, repo };
}

function getPrivateKey() {
  const encoded = env.GITHUB_APP_PRIVATE_KEY_BASE64;
  if (!encoded) {
    throw new Error('GITHUB_APP_PRIVATE_KEY_BASE64 환경변수가 설정되지 않았습니다.');
  }
  return Buffer.from(encoded, 'base64').toString('utf8');
}

/**
 * GitHub App 인증용 단기 JWT(RS256)를 만든다. GitHub은 유효기간 10분을 초과하면 거부한다.
 */
function createAppJwt() {
  const appId = env.GITHUB_APP_ID;
  if (!appId) {
    throw new Error('GITHUB_APP_ID 환경변수가 설정되지 않았습니다.');
  }

  const now = Math.floor(Date.now() / 1000);
  const segments = [
    Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url'),
    // iat를 60초 당겨 GitHub 서버와의 시계 오차를 흡수한다.
    Buffer.from(JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId })).toString('base64url'),
  ];

  const signer = createSign('RSA-SHA256');
  signer.update(segments.join('.'));
  signer.end();
  segments.push(signer.sign(getPrivateKey()).toString('base64url'));

  return segments.join('.');
}

// 설치 토큰은 1시간짜리라, 함수 인스턴스가 살아있는 동안 재사용해 발급 왕복을 줄인다.
let cachedInstallationToken = null;

async function getInstallationToken() {
  if (cachedInstallationToken && cachedInstallationToken.expiresAt - Date.now() > 60_000) {
    return cachedInstallationToken.token;
  }

  const installationId = env.GITHUB_APP_INSTALLATION_ID;
  if (!installationId) {
    throw new Error('GITHUB_APP_INSTALLATION_ID 환경변수가 설정되지 않았습니다.');
  }

  const response = await fetch(
    `${API_BASE_URL}/app/installations/${encodeURIComponent(installationId)}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${createAppJwt()}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub App 설치 토큰 발급 실패 (${response.status}): ${detail}`);
  }

  const data = await response.json();
  cachedInstallationToken = { token: data.token, expiresAt: new Date(data.expires_at).getTime() };
  return data.token;
}

function endpoint(path) {
  const { owner, repo } = getRepository();
  return `${API_BASE_URL}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;
}

async function headers() {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${await getInstallationToken()}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

/**
 * Returns decoded UTF-8 text for text files, otherwise a Buffer, plus GitHub's SHA.
 */
export async function getFile(path) {
  const response = await fetch(endpoint(path), { headers: await headers() });
  if (response.status === 404) return null;
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub Contents API 요청 실패 (${response.status}): ${detail}`);
  }

  const file = await response.json();
  const content = Buffer.from((file.content || '').replace(/\n/g, ''), 'base64');
  const isText = /\.(?:json|js|jsx|ts|tsx|css|html|md|txt|yml|yaml)$/i.test(path);

  return { content: isText ? content.toString('utf8') : content, sha: file.sha };
}

export async function putFile(path, contentBuffer, message, sha) {
  const body = {
    message,
    content: Buffer.from(contentBuffer).toString('base64'),
    branch: 'main',
  };
  if (sha) body.sha = sha;

  const response = await fetch(endpoint(path), {
    method: 'PUT',
    headers: { ...(await headers()), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub Contents API 요청 실패 (${response.status}): ${detail}`);
  }

  return response.json();
}
