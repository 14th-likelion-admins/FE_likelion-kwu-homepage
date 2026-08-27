import { getFile, putFile } from './_lib/github.js';
import { Buffer } from 'node:buffer';
import { readJsonBody, requireMethod, requirePassphrase, sendJson } from './_lib/request.js';

export default async function handler(request, response) {
  if (!requireMethod(request, response, 'PUT')) return;

  try {
    const { passphrase, activityType, generation, title, blocks } = await readJsonBody(request);
    if (!requirePassphrase(response, passphrase)) return;
    if (!activityType || generation === undefined || !title || !Array.isArray(blocks)) {
      return sendJson(response, 400, { success: false, message: '필수 입력값이 누락되었거나 형식이 올바르지 않습니다.' });
    }

    const existing = await getFile('src/data/magazines.json');
    const data = existing ? JSON.parse(existing.content) : {};
    data[activityType] ??= {};
    data[activityType][String(generation)] = { title, blocks };

    await putFile(
      'src/data/magazines.json',
      Buffer.from(`${JSON.stringify(data, null, 2)}\n`),
      `feat(content): update magazine ${activityType} ${generation}th`,
      existing?.sha,
    );
    return sendJson(response, 200, { success: true });
  } catch (error) {
    console.error('Magazine registration failed:', error);
    return sendJson(response, 500, { success: false, message: '매거진 저장에 실패했습니다.' });
  }
}
