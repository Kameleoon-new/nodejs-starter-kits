/**
 * Server-side tracking.
 *
 * A hybrid page where the Node.js SDK evaluates the feature flag and reports the
 * exposure to Kameleoon itself. engine.js is loaded as well: it receives the visitor
 * code and the consent, so that what it tracks in the browser (goals, data points)
 * belongs to the same visitor.
 */
import type { Request, Response } from "express"
import type { Variation } from "@kameleoon/nodejs-sdk"
import { config } from "../config"
import { kameleoonClient } from "../kameleoon"
import { getVisitor } from "../visitor"

export function serverTrackingPage(req: Request, res: Response): void {
  // 1. Visitor code and consent, given to the SDK (visitor.ts).
  const { visitorCode, consent } = getVisitor(req, res)

  // 2. Evaluate the feature flag. Tracking is on by default, so this call also reports
  //    the exposure to Kameleoon from the server.
  //    getVariation throws when the flag cannot be evaluated: the key is unknown, the
  //    flag is disabled in the environment, or the project blocks experiments for a
  //    visitor who denied consent. None of these may break the page, so the visitor
  //    gets the default experience (variation = null).
  let variation: Variation | null = null
  try {
    variation = kameleoonClient.getVariation({ visitorCode, featureKey: config.featureKey })
  } catch (error) {
    console.warn(`Feature flag "${config.featureKey}" was not evaluated:`, error instanceof Error ? error.message : error)
  }

  // 3. Render. The template gives the same visitor code and consent to engine.js
  //    (views/partials/kameleoon.ejs).
  res.render("server-tracking", {
    siteCode: config.siteCode,
    visitorCode,
    consent,
    featureKey: config.featureKey,
    variation,
  })
}
