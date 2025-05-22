/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'node:path'
// import type { PrismaConfig } from 'prisma'

export default {
  earlyAccess: true,
  schema: path.join('prisma'),
} satisfies any
