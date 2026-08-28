import { Buffer } from 'node:buffer';
import { env } from 'node:process';
import { getFile } from './_lib/github.js';

/**
 * 임시 진단 엔드포인트 — 원인 파악 후 반드시 삭제할 것.
 *
 * 401은 "환경변수 미설정"과 "값 불일치"를 구분하지 않기 때문에 외부에서 원인을 좁힐 수 없다.
 * 여기서는 비밀값을 절대 반환하지 않고, 존재 여부와 형태(공백 혼입 등)만 보고한다.
 * GitHub 확인도 읽기 전용이라 저장소에 아무것도 쓰지 않는다.
 */
export default async function handler(request, response) {
  const passphrase = env.CONTENT_WRITE_PASSPHRASE;

  const report = {
    configured: {
      GITHUB_APP_ID: Boolean(env.GITHUB_APP_ID),
      GITHUB_APP_INSTALLATION_ID: Boolean(env.GITHUB_APP_INSTALLATION_ID),
      GITHUB_APP_PRIVATE_KEY_BASE64: Boolean(env.GITHUB_APP_PRIVATE_KEY_BASE64),
      CONTENT_WRITE_PASSPHRASE: Boolean(passphrase),
    },
    // 저장소 이름은 공개 정보라 그대로 노출해 오타를 확인한다.
    GITHUB_REPO: env.GITHUB_REPO ?? null,
    // 붙여넣기 사고를 잡기 위한 형태 검사. 길이나 내용은 노출하지 않는다.
    passphraseShape: passphrase
      ? {
          hasSurroundingWhitespace: passphrase !== passphrase.trim(),
          hasTrailingNewline: /[\r\n]$/.test(passphrase),
          isEmptyAfterTrim: passphrase.trim().length === 0,
        }
      : null,
    legacyTokenStillSet: Boolean(env.GITHUB_CONTENT_TOKEN),
  };

  if (env.GITHUB_APP_PRIVATE_KEY_BASE64) {
    const decoded = Buffer.from(env.GITHUB_APP_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
    report.privateKeyLooksLikePem = decoded.trimStart().startsWith('-----BEGIN');
  }

  try {
    const file = await getFile('src/data/magazines.json');
    report.githubAuth = file ? 'ok' : 'ok (대상 파일 없음)';
  } catch (error) {
    report.githubAuth = `실패: ${error.message}`;
  }

  response.status(200).json(report);
}
