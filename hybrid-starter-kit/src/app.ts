/**
 * Web server: two hybrid pages. Both use the Node.js SDK together with engine.js and
 * synchronize the visitor code and the consent. They differ in who reports the exposure.
 *
 *   /server-tracking   the Node.js SDK reports the exposure   (pages/server-tracking.ts)
 *   /engine-tracking   engine.js reports the exposure         (pages/engine-tracking.ts)
 */
import path from "node:path"
import express from "express"
import { config } from "./config"
import { initializeKameleoon } from "./kameleoon"
import { engineTrackingPage } from "./pages/engine-tracking"
import { serverTrackingPage } from "./pages/server-tracking"

const app = express()
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Every page contains the visitor code of one visitor, so it must never be cached
// and served to somebody else.
app.use((_req, res, next) => {
  res.set("Cache-Control", "no-store")
  next()
})

app.get("/", (_req, res) => res.redirect("/server-tracking"))
app.get("/server-tracking", serverTrackingPage)
app.get("/engine-tracking", engineTrackingPage)

async function start(): Promise<void> {
  // The SDK has to be ready before the first request is served
  await initializeKameleoon()

  app.listen(config.port, () => {
    console.log(`Hybrid starter kit is running at http://localhost:${config.port}`)
  })
}

start().catch((error) => {
  console.error("Failed to start:", error)
  process.exit(1)
})
