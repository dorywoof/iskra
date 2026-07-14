import sharp from 'sharp'
import { readFileSync } from 'node:fs'

const svg = readFileSync(new URL('../public/favicon.svg', import.meta.url))

for (const size of [192, 512]) {
  await sharp(svg, { density: 400 })
    .resize(size, size)
    .png()
    .toFile(new URL(`../public/icon-${size}.png`, import.meta.url).pathname.replace(/^\//, ''))
  console.log(`wrote icon-${size}.png`)
}
