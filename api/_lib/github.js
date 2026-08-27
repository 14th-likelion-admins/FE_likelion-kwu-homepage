import { Buffer } from 'node:buffer';
import { env } from 'node:process';

const API_BASE_URL = 'https://api.github.com';

function getRepository() {
  const repository = env.GITHUB_REPO;
  const token = env.GITHUB_CONTENT_TOKEN;

  if (!repository || !token) {
    throw new Error('GitHub 콘텐츠 저장 환경변수가 설정되지 않았습니다.');
  }

  const [owner, repo, ...rest] = repository.split('/');
  if (!owner || !repo || rest.length > 0) {
    throw new Error('GITHUB_REPO는 "owner/repository" 형식이어야 합니다.');
  }

  return { owner, repo, token };
}

function endpoint(path) {
  const { owner, repo } = getRepository();
  return `${API_BASE_URL}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;
}

function headers() {
  const { token } = getRepository();
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function githubRequest(url, options) {
  const response = await fetch(url, options);
  if (response.ok) return response;

  const detail = await response.text();
  throw new Error(`GitHub Contents API 요청 실패 (${response.status}): ${detail}`);
}

/**
 * Returns decoded UTF-8 text for text files, otherwise a Buffer, plus GitHub's SHA.
 */
export async function getFile(path) {
  const response = await fetch(endpoint(path), { headers: headers() });
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

  const response = await githubRequest(endpoint(path), {
    method: 'PUT',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return response.json();
}
