import { Context } from 'hono'

export const env = (c: Context) => {
  return {
    DB: c.env.DB,
    DB2: c.env.DB2,
    DB3: c.env.DB3,
    DB4: c.env.DB4,
  }
}
