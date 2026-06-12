import { resolve, relative } from 'path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs'

// Helper function to recursively find all HTML files
function getHtmlFiles(dir) {
  let results = []
  const list = readdirSync(dir)
  list.forEach(file => {
    const filePath = resolve(dir, file)
    const stat = statSync(filePath)
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        results = results.concat(getHtmlFiles(filePath))
      }
    } else if (file.endsWith('.html')) {
      results.push(filePath)
    }
  })
  return results
}

const htmlFiles = getHtmlFiles(__dirname)
const input = {}

htmlFiles.forEach(file => {
  const relativePath = relative(__dirname, file).replace(/\\/g, '/')
  const name = relativePath.replace(/\.html$/, '')
  input[name] = file
})

// Custom plugin to increment HTML version inside pages/index.html on every build
function incrementVersionPlugin() {
  return {
    name: 'increment-version',
    buildStart() {
      const filePath = resolve(__dirname, 'pages/index.html')
      try {
        let content = readFileSync(filePath, 'utf-8')
        const regex = /<!-- VERSION_START -->([\d\.]+)(-[\w\.]+)?<!-- VERSION_END -->/
        const match = content.match(regex)
        if (match) {
          const currentVersion = match[1]
          const suffix = match[2] || ''
          
          const versionNum = parseFloat(currentVersion)
          const newVersion = (versionNum + 0.1).toFixed(1)
          
          const replacement = `<!-- VERSION_START -->${newVersion}${suffix}<!-- VERSION_END -->`
          content = content.replace(regex, replacement)
          writeFileSync(filePath, content, 'utf-8')
          console.log(`\n\x1b[32m[Version Auto-Increment] Incremented source index.html version: ${currentVersion}${suffix} -> ${newVersion}${suffix}\x1b[0m\n`)
        }
      } catch (err) {
        console.error('Failed to auto-increment version:', err)
      }
    }
  }
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    incrementVersionPlugin(),
    {
      name: 'html-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/' || req.url === '/index.html') {
            req.url = '/pages/index.html'
          }
          next()
        })
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/' || req.url === '/index.html') {
            req.url = '/pages/index.html'
          }
          next()
        })
      }
    }
  ],
  build: {
    rollupOptions: {
      input,
    },
  },
})
