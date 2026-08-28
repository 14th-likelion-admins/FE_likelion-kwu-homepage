import { getFile, putFile } from './_lib/github.js';
import { Buffer } from 'node:buffer';
import { readJsonBody, requireMethod, requirePassphrase, sendJson } from './_lib/request.js';

export default async function handler(request, response) {
  if (!requireMethod(request, response, ['PUT', 'DELETE'])) return;
  const removing = request.method === 'DELETE';

  try {
    const { passphrase, activityType, generation, title, blocks } = await readJsonBody(request);
    if (!requirePassphrase(response, passphrase)) return;
    if (!activityType || generation === undefined || (!removing && (!title || !Array.isArray(blocks)))) {
      return sendJson(response, 400, { success: false, message: '필수 입력값이 누락되었거나 형식이 올바르지 않습니다.' });
    }

    const existing = await getFile('src/data/magazines.json');
    const data = existing ? JSON.parse(existing.content) : {};
    const key = String(generation);

    if (removing) {
      if (!data[activityType]?.[key]) {
        return sendJson(response, 404, { success: false, message: '삭제할 매거진을 찾을 수 없습니다.' });
      }
      delete data[activityType][key];
      // 활동 아래 기수가 하나도 안 남으면 빈 객체를 남기지 않는다.
      if (Object.keys(data[activityType]).length === 0) delete data[activityType];
    } else {
      data[activityType] ??= {};
      data[activityType][key] = { title, blocks };
    }

    // 본문에 딸린 업로드 이미지는 public/uploads에 그대로 둔다. 파일마다 삭제
    // 요청을 더 보내면 중간에 실패했을 때 데이터와 파일이 어긋난 채 남는다.
    await putFile(
      'src/data/magazines.json',
      Buffer.from(`${JSON.stringify(data, null, 2)}\n`),
      `feat(content): ${removing ? 'remove' : 'update'} magazine ${activityType} ${generation}th`,
      existing?.sha,
    );
    return sendJson(response, 200, { success: true });
  } catch (error) {
    console.error(`Magazine ${removing ? 'deletion' : 'registration'} failed:`, error);
    return sendJson(response, 500, { success: false, message: `매거진 ${removing ? '삭제' : '저장'}에 실패했습니다.` });
  }
}
