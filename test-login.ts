import { PrismaClient } from '@prisma/client'

async function main() {
  let bcrypt: any
  try { bcrypt = (await import('bcryptjs')).default } catch { bcrypt = (await import('bcrypt')).default }

  const p = new PrismaClient()
  const u = await p.user.findUnique({ where: { email: 'admin@chefshift.nl' } })
  if (!u) { console.log('USER INTROUVABLE'); return }

  const ok = await bcrypt.compare('admin123', u.password)
  console.log('password ok:', ok)

  if (!ok) {
    const hash = await bcrypt.hash('admin123', 12)
    await p.user.update({ where: { email: 'admin@chefshift.nl' }, data: { password: hash } })
    console.log('MOT DE PASSE REINITIALISE à admin123')
  }
}
main()
