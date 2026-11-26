/**
 * Application settings, read once from the environment (.env).
 *
 * A missing required value stops the app at startup with a clear message,
 * instead of failing later on the first request that needs it.
 */
import "dotenv/config"

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing environment variable ${name}. Copy .env-template to .env and fill it in.`)
  }
  return value
}

function optional(name: string): string | undefined {
  return process.env[name]?.trim() || undefined
}

export const config = {
  port: Number(optional("PORT") ?? 3000),

  // Required
  siteCode: required("KAMELEOON_SITECODE"),
  clientId: required("KAMELEOON_CLIENT_ID"),
  clientSecret: required("KAMELEOON_CLIENT_SECRET"),
  featureKey: required("KAMELEOON_FEATURE_KEY"),

  // Optional: the SDK uses "production" and a host-only cookie when these are not set
  environment: optional("KAMELEOON_ENVIRONMENT"),
  cookieDomain: optional("KAMELEOON_COOKIE_DOMAIN"),
}
