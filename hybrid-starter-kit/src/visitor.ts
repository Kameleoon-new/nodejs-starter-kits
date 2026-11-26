/**
 * Visitor synchronization, server half. Both pages start with `getVisitor`.
 *
 * In hybrid mode the SDK and engine.js must agree on two things:
 *   - the visitor code: who the visitor is. With the same code on both sides, a goal
 *     tracked by engine.js in the browser is attributed to the variation the SDK
 *     assigned on the server.
 *   - the legal consent: what Kameleoon is allowed to do for this visitor. Each side
 *     has to be told separately.
 *
 * This file gives both to the SDK. The template views/partials/kameleoon.ejs gives
 * the same two values to engine.js.
 */
import type { Request, Response } from "express"
import { kameleoonClient } from "./kameleoon"

/**
 * Cookie in which the site stores the consent choice ("true" or "false").
 * Here it is written by views/partials/consent.ejs. On a real site, read the
 * choice from your consent management platform instead.
 */
const CONSENT_COOKIE = "kameleoonConsent"

/** "unknown": the visitor has not chosen yet. */
export type Consent = "granted" | "denied" | "unknown"

export interface Visitor {
  visitorCode: string
  consent: Consent
}

export function getVisitor(req: Request, res: Response): Visitor {
  // 1. Visitor code: read it from the `kameleoonVisitorCode` cookie, or create a new
  //    one. When the Kameleoon project requires consent, the SDK does not write the
  //    cookie here. It waits for step 2.
  const visitorCode = kameleoonClient.getVisitorCode({ request: req, response: res })

  // 2. Legal consent: pass the visitor's choice to the SDK. With consent granted the
  //    SDK writes the visitor code cookie on the response. While the choice is
  //    unknown there is nothing to pass.
  //    The app only passes the choice on. What the SDK does with it is decided by the
  //    consent policy of the Kameleoon project (see "Consent" in the README).
  const consent = readConsent(req)
  if (consent !== "unknown") {
    kameleoonClient.setLegalConsent({
      visitorCode,
      consent: consent === "granted",
      response: res,
    })
  }

  return { visitorCode, consent }
}

function readConsent(req: Request): Consent {
  const cookies = req.headers.cookie?.split(/;\s*/) ?? []
  const value = cookies.find((cookie) => cookie.startsWith(`${CONSENT_COOKIE}=`))?.slice(CONSENT_COOKIE.length + 1)

  if (value === "true") return "granted"
  if (value === "false") return "denied"
  return "unknown"
}
