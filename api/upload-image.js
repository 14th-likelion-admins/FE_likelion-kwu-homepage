import { randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { putFile } from './_lib/github.js';
import { readRequestBuffer, requireMethod, requirePassphrase, sendJson } from './_lib/request.js';

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_FOLDERS = new Set(['magazines', 'projects']);
const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

function multipartParts(body, contentType) {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;\s]+))/i);
  if (!boundaryMatch) throw new Error('MULTIPART_BOUNDARY_MISSING');
  const boundary = Buffer.from(`--${boundaryMatch[1] || boundaryMatch[2]}`);
  const delimiter = Buffer.from('\r\n\r\n');
  const parts = [];
  let offset = 0;

  while (true) {
    const start = body.indexOf(boundary, offset);
    if (start < 0) break;
    const next = body.indexOf(boundary, start + boundary.length);
    if (next < 0) break;
    const section = body.subarray(start + boundary.length + 2, next - 2);
    const headerEnd = section.indexOf(delimiter);
    if (headerEnd >= 0) {
      const headerText = section.subarray(0, headerEnd).toString('utf8');
      const name = headerText.match(/name="([^"]+)"/i)?.[1];
      const filename = headerText.match(/filename="([^"]*)"/i)?.[1];
      const mimeType = headerText.match(/content-type:\s*([^\r\n;]+)/i)?.[1]?.toLowerCase();
      if (name) parts.push({ name, filename, mimeType, value: section.subarray(headerEnd + delimiter.length) });
    }
    offset = next;
  }
  return parts;
}

// bodyParser를 끄는 설정이 없는 것이 정상이다. 이 프로젝트는 Vite이고 api/*.js는
// Vercel의 Node 함수라, Next.js API Route 형식인
// `export const config = { api: { bodyParser: false } }`는 읽히지 않는다.
// 예전에 그 줄이 있었지만 아무 효과가 없어서 지웠다. 이 핸들러가 multipart를 다룰 수
// 있는 이유는 설정이 아니라 아래 readRequestBuffer가 요청 스트림을 직접 읽기
// 때문이다(request.body를 건드리지 않는다). 다시 넣지 말 것.

export default async function handler(request, response) {
  if (!requireMethod(request, response, 'POST')) return;

  try {
    const contentType = request.headers['content-type'] || '';
    if (!contentType.startsWith('multipart/form-data')) {
      return sendJson(response, 400, { success: false, message: 'multipart/form-data 요청이 필요합니다.' });
    }

    // Multipart overhead is small; the file itself is still checked against exactly 4 MB below.
    const body = await readRequestBuffer(request, MAX_FILE_SIZE + 64 * 1024);
    const parts = multipartParts(body, contentType);
    const fields = Object.fromEntries(parts.filter((part) => !part.filename).map((part) => [part.name, part.value.toString('utf8')]));
    const file = parts.find((part) => part.name === 'file' && part.filename);

    if (!requirePassphrase(response, fields.passphrase)) return;
    if (!ALLOWED_FOLDERS.has(fields.folder)) {
      return sendJson(response, 400, { success: false, message: '유효하지 않은 업로드 폴더입니다.' });
    }
    if (!file || !MIME_EXTENSIONS[file.mimeType]) {
      return sendJson(response, 400, { success: false, message: '이미지 파일만 업로드할 수 있습니다.' });
    }
    if (file.value.length > MAX_FILE_SIZE) {
      return sendJson(response, 400, { success: false, message: '이미지 파일은 4MB 이하여야 합니다.' });
    }

    // 확장자는 클라이언트가 보낸 파일명이 아니라 이미 검증된 mimeType에서만 결정한다.
    // (파일명은 위조 가능해서 그대로 쓰면 .html 등으로 저장되어 저장형 XSS 벡터가 될 수 있음)
    const extension = MIME_EXTENSIONS[file.mimeType];
    const filename = `${randomUUID()}.${extension}`;
    await putFile(`public/uploads/${fields.folder}/${filename}`, file.value, `chore(content): upload image ${filename}`);

    return sendJson(response, 200, { success: true, url: `/uploads/${fields.folder}/${filename}` });
  } catch (error) {
    if (error.code === 'REQUEST_TOO_LARGE') {
      return sendJson(response, 400, { success: false, message: '이미지 파일은 4MB 이하여야 합니다.' });
    }
    console.error('Image upload failed:', error);
    return sendJson(response, 500, { success: false, message: '이미지 업로드에 실패했습니다.' });
  }
}
