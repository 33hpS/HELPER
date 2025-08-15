// scripts/build.mjs
import * as esbuild from 'esbuild'
import { rimraf } from 'rimraf'
import fs from 'fs'
import path from 'path'
import stylePlugin from 'esbuild-style-plugin'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'

const args = process.argv.slice(2)
const isProd = args[0] === '--production'

// Очистка dist
await rimraf('dist')

// Копируем index.html, удаляя dev‑скрипт в продакшене
let html = fs.readFileSync('index.html', 'utf-8')
if (isProd) {
  html = html.replace(/<script>\s*new EventSource[\s\S]*?<\/script>/, '')
}
fs.mkdirSync('dist', { recursive: true })
fs.writeFileSync('dist/index.html', html)

// Копируем CSS (если подключён через <link>)
;['main.css', 'src/shadcn.css'].forEach(cssPath => {
  if (fs.existsSync(cssPath)) {
    fs.copyFileSync(cssPath, path.join('dist', path.basename(cssPath)))
  }
})

/** @type {esbuild.BuildOptions} */
const esbuildOpts = {
  color: true,
  entryPoints: ['src/main.tsx'],
  outdir: 'dist',
  entryNames: '[name]',
  write: true,
  bundle: true,
  format: 'iife',
  target: ['es2018'],
  sourcemap: isProd ? false : 'linked',
  minify: isProd,
  treeShaking: true,
  jsx: 'automatic',
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
  console.log(`Running on:`)
  hosts.forEach(host => console.log(`http://${host}:${port}`))
}
