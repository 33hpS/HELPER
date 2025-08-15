// scripts/build.mjs
import * as esbuild from 'esbuild'
import { rimraf } from 'rimraf'
import fs from 'fs'
import stylePlugin from 'esbuild-style-plugin'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'

const args = process.argv.slice(2)
const isProd = args.includes('--production')

await rimraf('dist')
fs.mkdirSync('dist', { recursive: true })

// Читаем HTML
let html = fs.readFileSync('index.html', 'utf-8')
if (isProd) {
  html = html.replace(/<script>\s*new EventSource[\s\S]*?<\/script>/, '')
}
fs.writeFileSync('dist/index.html', html)

/** @type {esbuild.BuildOptions} */
const esbuildOpts = {
  entryPoints: [
    'src/main.tsx',     // твой React вход
    'src/shadcn.css'    // отдельная точка для CSS
  ],
  outdir: 'dist',
  entryNames: '[name]', // получим main.js и shadcn.css
  bundle: true,
  minify: isProd,
  format: 'iife',
  target: ['es2018'],
  sourcemap: !isProd,
  jsx: 'automatic',
  treeShaking: true,
  define: {
    'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
  },
  loader: {
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.svg': 'file',
    '.woff': 'file',
    '.woff2': 'file',
  },
  plugins: [
    stylePlugin({
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
      extract: true, // <‑‑ отдельный CSS файл
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
  hosts.forEach(h => console.log(`http://${h}:${port}`))
}
