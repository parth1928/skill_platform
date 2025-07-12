import jwt from "jsonwebtoken"

if (!process.env.JWT_SECRET) {
  throw new Error('Invalid/Missing environment variable: "JWT_SECRET"')
}

const JWT_SECRET = process.env.JWT_SECRET

export async function verifyJwt(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded as { userId: string; email: string }
  } catch (error) {
    return null
  }
}

export async function createJwt(payload: { userId: string; email: string }) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d" // Token expires in 7 days
  })
}
