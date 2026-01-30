import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@example.com'
    const password = 'adminpassword' // Change this in production!

    const existingAdmin = await prisma.adminUser.findUnique({
        where: { email },
    })

    if (existingAdmin) {
        console.log('Admin user already exists.')
        return
    }

    const hashedPassword = await hash(password, 12)

    const admin = await prisma.adminUser.create({
        data: {
            email,
            password: hashedPassword,
            role: 'admin',
        },
    })

    console.log(`Admin created: ${admin.email}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
