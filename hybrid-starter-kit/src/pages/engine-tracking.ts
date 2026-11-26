/**
 * Engine-side tracking.
 *
 * A hybrid page where the Node.js SDK still decides which variation the visitor gets,
 * but reports nothing. It produces a piece of JavaScript, the engine tracking code,
 * that tells engine.js about the assignments. engine.js then reports the exposure
 * from the browser, which also sends it to the analytics integrations activated in
 * Kameleoon (Google Analytics 4, Mixpanel, Segment and so on).
 */
import type { Request, Response } from "express"
import { config } from "../config"
import { kameleoonClient } from "../kameleoon"
import { getVisitor } from "../visitor"

export function engineTrackingPage(req: Request, res: Response): void {
  // 1. Visitor code and consent, given to the SDK (visitor.ts). Same as with
  //    server-side tracking.
  const { visitorCode, consent } = getVisitor(req, res)

  // 2. Evaluate the feature flags.
  //    track: false -> the SDK assigns the variations but does not report the exposure,
  //    because engine.js will. This is the only difference with server-side tracking:
  //    getVariation({ visitorCode, featureKey, track: false }) works the same way for
  //    a single flag.
  //    getVariations evaluates every flag of the project and engine.js reports all of
  //    them. On a real page, evaluate only the flags the page uses.
  //    Flags that are disabled in the environment, or blocked because consent is
  //    denied, are left out of the result.
  const variations = kameleoonClient.getVariations({ visitorCode, track: false })

  // 3. Build the engine tracking code. It covers every assignment the SDK made for
  //    this visitor in the last 5 seconds, so call it right after the evaluation, in
  //    the same request.
  const engineTrackingCode = kameleoonClient.getEngineTrackingCode(visitorCode)

  // 4. Render. The template gives the visitor code and consent to engine.js, then
  //    prints the tracking code before the engine.js tag (views/partials/kameleoon.ejs).
  res.render("engine-tracking", {
    siteCode: config.siteCode,
    visitorCode,
    consent,
    variations,
    engineTrackingCode,
  })
}
