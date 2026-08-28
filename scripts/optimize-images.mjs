import { mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, '..')
const assetRoots = [path.join(repositoryRoot, 'src', 'assets'), path.join(repositoryRoot, 'public')]
const uploadsRoot = path.join(repositoryRoot, 'public', 'uploads')
const reportPath = path.join(scriptDirectory, '.image-report-before.txt')
const rasterExtensions = new Set(['.png', '.jpg', '.jpeg'])

// Phase 1 uses measured, image-specific settings. Do not overwrite those outputs
// when the general Phase 2 conversion is run.
const phaseOneSources = new Set([
  'src/assets/noise-bg.png',
  'src/assets/recruit/Noise & Texture.png',
  'src/assets/activities/Noise & Texture.png',
  'src/assets/noise-texture.png',
  'src/assets/noise-star.png',
  'src/assets/gradiant-bg.png',
])

const pngExceptions = new Set(['public/thumbnail.png', 'public/kw-logo.png'])

function toPosix(relativePath) {
  return relativePath.split(path.sep).join('/')
}

function relativeToRepository(filePath) {
  return toPosix(path.relative(repositoryRoot, filePath))
}

function isInside(candidatePath, parentPath) {
  const relativePath = path.relative(parentPath, candidatePath)
  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    // Runtime uploads are referenced by string URLs in JSON. Their names and
    // extensions must remain byte-for-byte stable even when grep finds no import.
    if (isInside(entryPath, uploadsRoot)) {
      continue
    }

    if (entry.isDirectory()) {
      files.push(...(await walk(entryPath)))
    } else if (entry.isFile()) {
      files.push(entryPath)
    }
  }

  return files
}

function imagePolicy(relativePath, size) {
  const basename = path.basename(relativePath).toLowerCase()
  const normalized = relativePath.toLowerCase()

  if (/projects-image-\d+\.(png|jpe?g)$/.test(basename)) {
    return { maxWidth: 1600, quality: 78 }
  }

  if (/projects-thumbnail-\d+\.(png|jpe?g)$/.test(basename)) {
    return { maxWidth: 800, quality: 75 }
  }

  if (/src\/assets\/curriculum\/(fe|be|de)_logo\.png$/.test(normalized)) {
    return { maxWidth: 800, quality: 80 }
  }

  if (basename === 'mainsun.png') {
    return { maxWidth: 1200, quality: 82 }
  }

  if (basename === 'bk-image-1.png' || normalized.endsWith('/activities/rectangle.png')) {
    return { maxWidth: 1728, quality: 75 }
  }

  if (/src\/assets\/recruit\/(left_half|right_half|full_circle|half_circle_line)\.png$/.test(normalized)) {
    return { maxWidth: 1200, quality: 78 }
  }

  return { maxWidth: size < 100_000 ? undefined : 1920, quality: 80 }
}

async function createBeforeReport() {
  const files = (await Promise.all(assetRoots.map(walk))).flat()
  const rows = await Promise.all(
    files.map(async (filePath) => ({
      bytes: (await stat(filePath)).size,
      path: relativeToRepository(filePath),
    })),
  )
  rows.sort((left, right) => right.bytes - left.bytes || left.path.localeCompare(right.path))

  const totalBytes = rows.reduce((sum, row) => sum + row.bytes, 0)
  const report = [
    `Generated: ${new Date().toISOString()}`,
    `Files: ${rows.length}`,
    `Total bytes: ${totalBytes}`,
    '',
    'Bytes\tPath',
    ...rows.map(({ bytes, path: filePath }) => `${bytes}\t${filePath}`),
    '',
  ].join('\n')

  await mkdir(scriptDirectory, { recursive: true })
  await writeFile(reportPath, report, 'utf8')
  console.log(`Wrote ${relativeToRepository(reportPath)} (${rows.length} files, ${totalBytes} bytes).`)
}

async function optimizeThumbnail(filePath) {
  const temporaryPath = `${filePath}.optimized.png`
  const metadata = await sharp(filePath).metadata()

  if (metadata.width / metadata.height !== 1200 / 630) {
    throw new Error(`public/thumbnail.png must already have a 1200:630 aspect ratio; found ${metadata.width}x${metadata.height}`)
  }

  await sharp(filePath)
    .resize({ width: 1200, height: 630, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(temporaryPath)

  return { temporaryPath, outputPath: filePath }
}

async function optimizeRaster(filePath) {
  const relativePath = relativeToRepository(filePath)
  const fileStats = await stat(filePath)
  const { maxWidth, quality } = imagePolicy(relativePath, fileStats.size)
  const outputPath = filePath.replace(/\.(png|jpe?g)$/i, '.webp')
  let pipeline = sharp(filePath)

  if (maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, fit: 'inside', withoutEnlargement: true })
  }

  await pipeline.webp({ quality, alphaQuality: 90, effort: 6 }).toFile(outputPath)
  return outputPath
}

async function optimizeAll() {
  const files = (await Promise.all(assetRoots.map(walk))).flat()
  const candidates = files.filter((filePath) => rasterExtensions.has(path.extname(filePath).toLowerCase()))
  let converted = 0
  let skipped = 0

  for (const filePath of candidates) {
    const relativePath = relativeToRepository(filePath)

    if (phaseOneSources.has(relativePath) || pngExceptions.has(relativePath)) {
      skipped += 1
      continue
    }

    const outputPath = await optimizeRaster(filePath)
    converted += 1
    console.log(`${relativePath} -> ${relativeToRepository(outputPath)}`)
  }

  const thumbnailPath = path.join(repositoryRoot, 'public', 'thumbnail.png')
  const { temporaryPath, outputPath } = await optimizeThumbnail(thumbnailPath)
  const { rename } = await import('node:fs/promises')
  await rename(temporaryPath, outputPath)

  console.log(`Converted ${converted} raster images; skipped ${skipped} protected or Phase 1 images.`)
  console.log('Optimized public/thumbnail.png as a PNG exception.')
}

const command = process.argv[2]

if (command === '--report-before') {
  await createBeforeReport()
} else if (command === '--convert') {
  await optimizeAll()
} else {
  console.log('Usage: npm run optimize:images -- --report-before | --convert')
}
