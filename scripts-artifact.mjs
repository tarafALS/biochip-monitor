// Turns dist/index.html (single-file build) into a page body for the Artifact preview
import { readFileSync, writeFileSync } from 'node:fs'
const html = readFileSync('dist/index.html', 'utf8')
const head = html.match(/<head>([\s\S]*)<\/head>/)[1].replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>/g, '')
const body = html.match(/<body>([\s\S]*)<\/body>/)[1]
const out = `${head}\n<style>:root{color-scheme:dark}</style>\n${body}`
writeFileSync(process.argv[2], out)
