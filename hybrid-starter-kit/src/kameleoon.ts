/**
 * Kameleoon SDK setup.
 *
 * Everything needed to create and start the SDK lives in this file. The pages only
 * import `kameleoonClient` and never deal with credentials or initialization.
 */
import { KameleoonClient } from "@kameleoon/nodejs-sdk"
import { KameleoonEventSource } from "@kameleoon/nodejs-event-source"
import { KameleoonRequester } from "@kameleoon/nodejs-requester"
import { KameleoonVisitorCodeManager } from "@kameleoon/nodejs-visitor-code-manager"
import { config } from "./config"

/** One client for the whole application. Create it once and reuse it for every request. */
export const kameleoonClient = new KameleoonClient({
  siteCode: config.siteCode,
  credentials: {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
  },
  configuration: {
    environment: config.environment,
    cookieDomain: config.cookieDomain,
  },
  // The Node.js SDK needs these three helpers to be passed in explicitly
  externals: {
    // Reads and writes the `kameleoonVisitorCode` cookie on the Node.js request / response
    visitorCodeManager: new KameleoonVisitorCodeManager(),
    // Receives configuration updates in real time
    eventSource: new KameleoonEventSource(),
    // Sends the HTTP requests of the SDK
    requester: new KameleoonRequester(),
  },
})

/**
 * Downloads the feature flag configuration of the project.
 *
 * It must finish before the first request is served: every other SDK method throws
 * until the client is initialized. Rejects when the configuration cannot be loaded,
 * for example with a wrong site code or wrong credentials.
 */
export async function initializeKameleoon(): Promise<void> {
  await kameleoonClient.initialize()
}
