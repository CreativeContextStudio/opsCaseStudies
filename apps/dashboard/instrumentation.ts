// Force Node.js to prefer IPv4 over IPv6 — fixes Neon serverless driver
// ConnectTimeoutError when the system tries IPv6 first and it times out.
import { setDefaultResultOrder } from 'node:dns'

export function register() {
  setDefaultResultOrder('ipv4first')
}
