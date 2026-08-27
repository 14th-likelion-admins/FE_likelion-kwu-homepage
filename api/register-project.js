import { getFile, putFile } from './_lib/github.js';
import { Buffer } from 'node:buffer';
import { readJsonBody, requireMethod, requirePassphrase, sendJson } from './_lib/request.js';

const REQUIRED_TEXT_FIELDS = ['title', 'tag', 'description', 'generation', 'activity', 'overview'];

export default async function handler(request, response) {
  if (!requireMethod(request, response, 'POST')) return;

  try {
    const body = await readJsonBody(request);
    const { passphrase, title, tag, description, generation, activity, overview, features, images } = body;
    if (!requirePassphrase(response, passphrase)) return;

    const hasAllTextFields = REQUIRED_TEXT_FIELDS.every((key) => typeof body[key] === 'string' && body[key].trim());
    if (!hasAllTextFields) {
      return sendJson(response, 400, { success: false, message: '필수 입력값이 누락되었거나 형식이 올바르지 않습니다.' });
    }
    if (!Array.isArray(images) || images.length < 1 || images.length > 10 || !Array.isArray(features) || features.length === 0) {
      return sendJson(response, 400, { success: false, message: '이미지는 1~10장, 기능은 한 개 이상 등록해야 합니다.' });
    }

    const existing = await getFile('src/data/registeredProjects.json');
    const data = existing ? JSON.parse(existing.content) : [];
    if (!Array.isArray(data)) throw new Error('registeredProjects.json must contain an array.');

    const id = `git-${Date.now()}`;
    data.unshift({
      id,
      title,
      tag,
      description,
      generation,
      activity,
      image: images[0],
      thumbnail: images[0],
      detail: { thumbnail: images[0], images, overview, features },
    });

    await putFile(
      'src/data/registeredProjects.json',
      Buffer.from(`${JSON.stringify(data, null, 2)}\n`),
      `feat(content): register project ${title}`,
      existing?.sha,
    );
    return sendJson(response, 200, { success: true, id });
  } catch (error) {
    console.error('Project registration failed:', error);
    return sendJson(response, 500, { success: false, message: '프로젝트 등록에 실패했습니다.' });
  }
}
