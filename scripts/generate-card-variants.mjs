/**
 * projects-image-{N}.webp 로부터 /projects 목록 카드 전용 축소본을 만든다.
 *
 * 카드는 데스크탑에서 309px, 모바일에서도 최대 660px 폭으로 그려지는데 원본은
 * 최대 1600px이다. 원본을 그대로 내려받으면 카드 한 장에 필요한 픽셀의 스무 배를
 * 쓰게 되므로, 폭별 축소본을 미리 만들어 두고 srcSet으로 브라우저가 고르게 한다.
 *
 * 출력 파일명은 `projects-image-{N}-{폭}w.webp` 형태이고, 폭이 파일명에 들어 있어
 * src/data/projectImages.js가 import.meta.glob으로 모아 srcSet을 조립한다.
 * 그래서 프로젝트를 추가할 때 import 문을 손으로 늘릴 필요가 없다.
 *
 * sharp는 저장소 의존성이 아니다. scripts/README.md 규칙대로 임시 설치해서 쓴다.
 *
 *   pnpm add -D sharp
 *   node scripts/generate-card-variants.mjs
 *   git checkout -- package.json pnpm-lock.yaml && pnpm install
 */
import { readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, '..')
const assetsDirectory = path.join(repositoryRoot, 'src', 'assets')

// 카드가 실제로 요구하는 폭의 상한은 모바일 767px에서 DPR 2일 때의 1320px이다.
// 1280을 최대 후보로 두면 그보다 큰 원본은 카드에 아예 쓰이지 않는다.
const TARGET_WIDTHS = [400, 800, 1280]

// 원본 폭에 근접한 후보는 만들어 봐야 용량만 늘고 화질 이득이 없다.
const NEAR_ORIGINAL_RATIO = 0.85

// 파일명에 폭이 들어 있어 projectImages.js가 glob으로 모아 srcSet을 조립한다.
const SOURCE_PATTERN = /^projects-image-(\d+)\.webp$/
const VARIANT_PATTERN = /^projects-image-(\d+)-(\d+)w\.webp$/

/**
 * 원본 폭에 맞춰 실제로 만들 축소본 폭 목록을 정한다.
 *
 * 원본보다 크게 늘리지 않고, 원본과 거의 같은 폭도 만들지 않는다. 가장 큰 후보는
 * 축소본이 아니라 원본 그 자체이며, 원본 폭은 매니페스트를 통해 넘긴다.
 */
function planWidths(sourceWidth) {
  return TARGET_WIDTHS.filter((width) => width <= sourceWidth * NEAR_ORIGINAL_RATIO)
}

/**
 * 이전 실행이 남긴 축소본을 지운다. 원본이 교체돼 폭이 달라졌을 때
 * 옛 파일이 srcSet에 섞여 들어가는 것을 막는다.
 */
async function removeStaleVariants(fileNames) {
  const stale = fileNames.filter((fileName) => VARIANT_PATTERN.test(fileName))

  for (const fileName of stale) {
    await unlink(path.join(assetsDirectory, fileName))
  }

  return stale.length
}

async function generate() {
  const fileNames = await readdir(assetsDirectory)
  const removed = await removeStaleVariants(fileNames)

  if (removed > 0) {
    console.log(`이전 축소본 ${removed}개를 지웠습니다.`)
  }

  const sources = fileNames.filter((fileName) => SOURCE_PATTERN.test(fileName)).sort()
  const sourceWidths = {}
  let written = 0

  for (const fileName of sources) {
    const sourcePath = path.join(assetsDirectory, fileName)
    const projectId = SOURCE_PATTERN.exec(fileName)[1]
    const { width: sourceWidth } = await sharp(sourcePath).metadata()
    const widths = planWidths(sourceWidth)

    sourceWidths[projectId] = sourceWidth

    for (const width of widths) {
      const outputName = `projects-image-${projectId}-${width}w.webp`

      await sharp(sourcePath)
        .resize({ width, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 74, alphaQuality: 90, effort: 6 })
        .toFile(path.join(assetsDirectory, outputName))

      written += 1
    }

    const plan = widths.length > 0 ? `${widths.join('w, ')}w + 원본` : '원본만'
    console.log(`projects-image-${projectId}.webp (${sourceWidth}px) -> ${plan}`)
  }

  // srcSet의 가장 큰 후보는 원본이다. 원본 폭은 파일명에 없으므로 여기서 넘긴다.
  const manifest = Object.fromEntries(
    Object.keys(sourceWidths)
      .sort((left, right) => Number(left) - Number(right))
      .map((projectId) => [projectId, sourceWidths[projectId]]),
  )

  await writeFile(
    path.join(repositoryRoot, 'src', 'data', 'projectImageWidths.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  )

  console.log(`축소본 ${written}개를 만들고 원본 폭 ${sources.length}개를 기록했습니다.`)
}

await generate()
