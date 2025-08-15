// scripts/build.mjs
import * as esbuild from 'esbuild'
import { rimraf } from 'rimraf'
import fs from 'fs'
import stylePlugin from 'esbuild-style-plugin'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'

const args = process.argv.slice(2)
const isProd = args[0] === '--production'

// 1. Чистим dist
await rimraf('dist')
fs.mkdirSync('dist', { recursive: true })

// 2. Берём index.html и убираем dev‑скрипт EventSource в продакшене
let html = fs.readFileSync('index.html', 'utf-8')
if (isProd) {
  html = html.replace(/<script>\s*new EventSource[\s\S]*?<\/script>/, '')
}
fs.writeFileSync('dist/index.html', html)

// 3. Настройка esbuild — бандлим main.tsx + импортированный shadcn.css внутрь main.js
/** @type {esbuild.BuildOptions} */
const esbuildOpts = {
  entryPoints: ['src/main.tsx'],
  outdir: 'dist',
  entryNames: '[name]',           // main.js
  bundle: true,
  format: 'iife',
  target: ['es2018'],
  sourcemap: !isProd,
  minify: isProd,
  jsx: 'automatic',
  treeShaking: true,
  define: {
    'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
  },
  loader: {
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.webp': 'file',
    '.svg': 'file',
    '.woff': 'file',
    '.woff2': 'file',
  },
  plugins: [
    stylePlugin({
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    }),
  ],
}

if (isProd) {
  await esbuild.build(esbuildOpts)
} else {
  const ctx = await esbuild.context(esbuildOpts)
  await ctx.watch()
  const { hosts, port } = await ctx.serve({ servedir: 'dist' })
  console.log('Dev server:')
  hosts.forEach(host => console.log(`http://${host}:${port}`))
}
