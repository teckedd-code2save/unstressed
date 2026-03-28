import 'dotenv/config'
import { buildApp } from './app.js'

async function main() {
  const app = await buildApp()
  const PORT = Number(process.env.PORT ?? 3001)
  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`🚀 Unstressed API running on :${PORT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
