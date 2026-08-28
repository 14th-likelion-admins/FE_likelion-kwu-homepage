import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, '..')
const tileSize = 512
const seamBlendWidth = 48

const tiles = [
  {
    source: 'src/assets/noise-bg.png',
    output: 'src/assets/noise-bg-tile.webp',
  },
  {
    source: 'src/assets/recruit/Noise & Texture.png',
    output: 'src/assets/recruit/noise-texture-recruit-tile.webp',
  },
  {
    source: 'src/assets/activities/Noise & Texture.png',
    output: 'src/assets/activities/noise-texture-activities-tile.webp',
  },
  {
    source: 'src/assets/noise-texture.png',
    output: 'src/assets/noise-texture-tile.webp',
  },
]

for (const { source, output } of tiles) {
  const sourcePath = path.join(repositoryRoot, source)
  const outputPath = path.join(repositoryRoot, output)
  const metadata = await sharp(sourcePath).metadata()
  const left = Math.floor((metadata.width - tileSize) / 2)
  const top = Math.floor((metadata.height - tileSize) / 2)
  const { data, info } = await sharp(sourcePath)
    .extract({ left, top, width: tileSize, height: tileSize })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const tile = Buffer.from(data)
  const pixelOffset = (x, y, channel) => (y * info.width + x) * info.channels + channel

  // Feather corresponding edge pixels so the required center crop remains
  // visually continuous when repeated. The central 416x416 area is untouched.
  for (let y = 0; y < info.height; y += 1) {
    for (let distance = 0; distance < seamBlendWidth; distance += 1) {
      const leftX = distance
      const rightX = info.width - 1 - distance
      const position = distance / (seamBlendWidth - 1)
      const weight = position * position * (3 - 2 * position)

      for (let channel = 0; channel < info.channels; channel += 1) {
        const leftOffset = pixelOffset(leftX, y, channel)
        const rightOffset = pixelOffset(rightX, y, channel)
        const leftValue = data[leftOffset]
        const rightValue = data[rightOffset]
        const midpoint = (leftValue + rightValue) / 2
        tile[leftOffset] = Math.round(midpoint + (leftValue - midpoint) * weight)
        tile[rightOffset] = Math.round(midpoint + (rightValue - midpoint) * weight)
      }
    }
  }

  const horizontallyBlended = Buffer.from(tile)
  for (let x = 0; x < info.width; x += 1) {
    for (let distance = 0; distance < seamBlendWidth; distance += 1) {
      const topY = distance
      const bottomY = info.height - 1 - distance
      const position = distance / (seamBlendWidth - 1)
      const weight = position * position * (3 - 2 * position)

      for (let channel = 0; channel < info.channels; channel += 1) {
        const topOffset = pixelOffset(x, topY, channel)
        const bottomOffset = pixelOffset(x, bottomY, channel)
        const topValue = horizontallyBlended[topOffset]
        const bottomValue = horizontallyBlended[bottomOffset]
        const midpoint = (topValue + bottomValue) / 2
        tile[topOffset] = Math.round(midpoint + (topValue - midpoint) * weight)
        tile[bottomOffset] = Math.round(midpoint + (bottomValue - midpoint) * weight)
      }
    }
  }

  await sharp(tile, { raw: info })
    .webp({ quality: 70, alphaQuality: 90, effort: 6, nearLossless: true })
    .toFile(outputPath)
  console.log(`${source} -> ${output}`)
}

await sharp(path.join(repositoryRoot, 'src/assets/noise-star.png'))
  .resize({ width: 1920, fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 65, alphaQuality: 90, effort: 6 })
  .toFile(path.join(repositoryRoot, 'src/assets/noise-star.webp'))
console.log('src/assets/noise-star.png -> src/assets/noise-star.webp')

await sharp(path.join(repositoryRoot, 'src/assets/gradiant-bg.png'))
  .resize({ width: 900, fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 80, alphaQuality: 90, effort: 6 })
  .toFile(path.join(repositoryRoot, 'src/assets/gradiant-bg.webp'))
console.log('src/assets/gradiant-bg.png -> src/assets/gradiant-bg.webp')
