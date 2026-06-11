import { resolve, relative } from 'path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { readdirSync, statSync } from 'fs'

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

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input,
    },
  },
})
