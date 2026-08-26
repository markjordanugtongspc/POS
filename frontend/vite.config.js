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

// ==========================================
// START: parseVersion
// Extracts stage (Alpha/Beta), major, minor, and patch numbers from a version string.
// ==========================================
function parseVersion(str) {
  const match = str.match(/(Alpha|Beta)?\s*v?(\d+)\.(\d+)\.(\d+)/i)
  if (!match) return { stage: 'Alpha', major: 0, minor: 1, patch: 1 }
  const stage = match[1] || 'Alpha'
  const major = parseInt(match[2], 10)
  const minor = parseInt(match[3], 10)
  const patch = parseInt(match[4], 10)
  return { stage, major, minor, patch }
}
// ==========================================
// END: parseVersion
// ==========================================

// ==========================================
// START: incrementVersion
// Calculates the next semantic version according to system rollover rules:
// - Format: Alpha v0.1.0 -> Alpha v0.1.1 ...
// - If patch reaches 99 (v0.1.99) -> rolls over to v0.2.0
// - If reaches v0.99.99 -> rolls over to Beta v1.0.0
// ==========================================
function incrementVersion(versionStr) {
  const { major: prevMajor, minor: prevMinor, patch: prevPatch } = parseVersion(versionStr)

  let major = prevMajor
  let minor = prevMinor
  let patch = prevPatch + 1

  if (patch > 99) {
    patch = 0
    minor += 1
  }
  if (minor > 99) {
    minor = 0
    major += 1
  }

  const stage = major >= 1 ? 'Beta' : 'Alpha'
  const numberStr = `v${major}.${minor}.${patch}`
  const fullStr = `${stage} ${numberStr}`

  return { stage, major, minor, patch, numberStr, fullStr }
}
// ==========================================
// END: incrementVersion
// ==========================================

// ==========================================
// START: incrementVersionPlugin
// Custom Vite plugin to auto-increment version across HTML files and docs on build.
// ==========================================
function incrementVersionPlugin() {
  return {
    name: 'increment-version',
    apply: 'build',
    buildStart() {
      const indexHtmlPath = resolve(__dirname, 'pages/index.html')
      const docPath = resolve(__dirname, '../DOCUMENTATION.md')
      try {
        let indexContent = readFileSync(indexHtmlPath, 'utf-8')
        const stageMatch = indexContent.match(/<!-- VERSION_STAGE -->([\s\S]*?)<!-- VERSION_STAGE_END -->/)
        const numberMatch = indexContent.match(/<!-- VERSION_NUMBER -->([\s\S]*?)<!-- VERSION_NUMBER_END -->/)
        const startMatch = indexContent.match(/<!-- VERSION_START -->([\s\S]*?)<!-- VERSION_END -->/)

        let currentVerStr = 'Alpha v0.1.1'
        if (stageMatch && numberMatch) {
          currentVerStr = `${stageMatch[1].trim()} ${numberMatch[1].trim()}`
        } else if (startMatch) {
          currentVerStr = startMatch[1].trim()
        }

        const newVer = incrementVersion(currentVerStr)

        // 1. Update all HTML files containing VERSION tags
        const allHtml = getHtmlFiles(__dirname)
        allHtml.forEach(file => {
          try {
            let content = readFileSync(file, 'utf-8')
            let updated = false

            if (content.includes('<!-- VERSION_STAGE -->')) {
              content = content.replace(
                /<!-- VERSION_STAGE -->([\s\S]*?)<!-- VERSION_STAGE_END -->/g,
                `<!-- VERSION_STAGE -->${newVer.stage}<!-- VERSION_STAGE_END -->`
              )
              updated = true
            }
            if (content.includes('<!-- VERSION_NUMBER -->')) {
              content = content.replace(
                /<!-- VERSION_NUMBER -->([\s\S]*?)<!-- VERSION_NUMBER_END -->/g,
                `<!-- VERSION_NUMBER -->${newVer.numberStr}<!-- VERSION_NUMBER_END -->`
              )
              updated = true
            }
            if (content.includes('<!-- VERSION_START -->')) {
              content = content.replace(
                /<!-- VERSION_START -->([\s\S]*?)<!-- VERSION_END -->/g,
                `<!-- VERSION_START -->${newVer.fullStr}<!-- VERSION_END -->`
              )
              updated = true
            }

            if (updated) {
              writeFileSync(file, content, 'utf-8')
            }
          } catch (fileErr) {
            console.error(`Failed to update version in ${file}:`, fileErr)
          }
        })

        // 2. Update DOCUMENTATION.md if present
        try {
          let docContent = readFileSync(docPath, 'utf-8')
          docContent = docContent.replace(
            /\*\*Version:\*\* .*/g,
            `**Version:** ${newVer.fullStr}`
          ).replace(
            /\*Jorgy POS System — Version .*\*/g,
            `*Jorgy POS System — Version ${newVer.fullStr}*`
          )
          writeFileSync(docPath, docContent, 'utf-8')
        } catch (docErr) {
          // DOCUMENTATION.md might be optional during build
        }

        console.log(`\n\x1b[32m[Version Auto-Increment] Incremented system version: ${currentVerStr} -> ${newVer.fullStr}\x1b[0m\n`)
      } catch (err) {
        console.error('Failed to auto-increment version:', err)
      }
    }
  }
}
// ==========================================
// END: incrementVersionPlugin
// ==========================================

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    resolve: {
      alias: {
        '@supabase/supabase-js': resolve(__dirname, 'node_modules/@supabase/supabase-js')
      }
    },
    esbuild: {
      drop: isDev ? [] : ['console', 'debugger']
    },
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
  }
})
