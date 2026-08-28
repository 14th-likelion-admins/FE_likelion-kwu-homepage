import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, '..')
const reportPath = path.join(scriptDirectory, '.noise-analysis.txt')
const meanThreshold = 3
const standardDeviationThreshold = 4

const targets = [
  'src/assets/noise-bg.png',
  'src/assets/recruit/Noise & Texture.png',
  'src/assets/activities/Noise & Texture.png',
  'src/assets/noise-texture.png',
  'src/assets/noise-star.png',
]

function range(values) {
  return Math.max(...values) - Math.min(...values)
}

async function analyze(relativePath) {
  const absolutePath = path.join(repositoryRoot, relativePath)
  const metadata = await sharp(absolutePath).metadata()
  const xEdges = Array.from({ length: 5 }, (_, index) => Math.round((metadata.width * index) / 4))
  const yEdges = Array.from({ length: 5 }, (_, index) => Math.round((metadata.height * index) / 4))
  const bands = []

  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      const left = xEdges[column]
      const top = yEdges[row]
      const width = xEdges[column + 1] - left
      const height = yEdges[row + 1] - top
      const statistics = await sharp(absolutePath).extract({ left, top, width, height }).stats()
      bands.push({ row, column, channels: statistics.channels })
    }
  }

  const channelCount = bands[0].channels.length
  const channels = Array.from({ length: channelCount }, (_, channelIndex) => {
    const meanRange = range(bands.map((band) => band.channels[channelIndex].mean))
    const standardDeviationRange = range(bands.map((band) => band.channels[channelIndex].stdev))
    return { channelIndex, meanRange, standardDeviationRange }
  })
  const uniform = channels.every(
    ({ meanRange, standardDeviationRange }) =>
      meanRange <= meanThreshold && standardDeviationRange <= standardDeviationThreshold,
  )

  return { relativePath, width: metadata.width, height: metadata.height, channels, uniform }
}

const results = []
for (const target of targets) {
  results.push(await analyze(target))
}

const lines = [
  `Thresholds (0-255 scale): mean range <= ${meanThreshold}; stdev range <= ${standardDeviationThreshold}`,
  '',
]

for (const result of results) {
  lines.push(`${result.relativePath} (${result.width}x${result.height})`)
  for (const channel of result.channels) {
    lines.push(
      `  channel ${channel.channelIndex}: mean range=${channel.meanRange.toFixed(6)}, stdev range=${channel.standardDeviationRange.toFixed(6)}`,
    )
  }
  lines.push(`  verdict: ${result.uniform ? 'uniform grain' : 'structured'}`, '')
}

lines.push(
  'Manual review: noise-star.png has a directional density/color structure; use full-image WebP instead of a 512px tile.',
  '',
)

await writeFile(reportPath, `${lines.join('\n')}\n`, 'utf8')
console.log(lines.join('\n'))
