import { randomUUID } from "crypto"
import bcrypt from "bcryptjs"
import { dbOperations } from "./database"

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = randomUUID()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await dbOperations.createSession({
    sessionId,
    userId,
    expiresAt,
  })
  return sessionId
}

export async function getSession(sessionId: string): Promise<{ userId: string } | null> {
  const session = await dbOperations.getSession(sessionId)
  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await dbOperations.deleteSession(sessionId)
    }
    return null
  }
  return { userId: session.userId }
}

export async function deleteSession(sessionId: string): Promise<void> {
  await dbOperations.deleteSession(sessionId)
}

export async function createUser(email: string, name: string, password: string) {
  const passwordHash = await hashPassword(password)

  try {
    const user = await dbOperations.createUser({
      email,
      name,
      passwordHash,
    })
    return { success: true, userId: user._id.toString() }
  } catch (error: any) {
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return { success: false, error: "Email already exists" }
    }
    throw error
  }
}

export async function authenticateUser(email: string, password: string) {
  const user = await dbOperations.getUserByEmail(email)
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { success: false, error: "Invalid credentials" }
  }

  const sessionId = await createSession(user._id.toString())
  return {
    success: true,
    sessionId,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    },
  }
}

export async function requireAuth(sessionId: string | undefined) {
  if (!sessionId) {
    throw new Error("Authentication required")
  }

  const session = await getSession(sessionId)
  if (!session) {
    throw new Error("Invalid or expired session")
  }

  return session.userId
}
