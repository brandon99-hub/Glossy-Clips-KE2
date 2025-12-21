import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db"
import type { Customer } from "@/lib/db"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                try {
                    const customers = await sql`
            SELECT * FROM customers 
            WHERE email = ${credentials.email as string}
          ` as Customer[]

                    if (customers.length === 0) {
                        return null
                    }

                    const customer = customers[0]
                    const passwordMatch = await bcrypt.compare(
                        credentials.password as string,
                        customer.password_hash
                    )

                    if (!passwordMatch) {
                        return null
                    }

                    return {
                        id: customer.id.toString(),
                        email: customer.email,
                        name: customer.name || customer.email.split('@')[0],
                    }
                } catch (error) {
                    console.error("Auth error:", error)
                    return null
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id as string
            }
            return session
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
