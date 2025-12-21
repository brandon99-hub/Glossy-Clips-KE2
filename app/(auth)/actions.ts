"use server"

import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import type { Customer } from "@/lib/db"
import { migrateWishlistToAccount } from "@/lib/wishlist-migration"

export async function loginAction(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
        // Verify credentials
        const customers = await sql`
      SELECT * FROM customers WHERE email = ${email}
    ` as Customer[]

        if (customers.length === 0) {
            return { success: false, error: "Invalid email or password" }
        }

        const customer = customers[0]
        const passwordMatch = await bcrypt.compare(password, customer.password_hash)

        if (!passwordMatch) {
            return { success: false, error: "Invalid email or password" }
        }

        // Migrate wishlist
        await migrateWishlistToAccount(customer.id)

        // Return success - client will handle signIn
        return { success: true, email, password }
    } catch (error) {
        console.error("Login error:", error)
        return { success: false, error: "Login failed" }
    }
}

export async function registerAction(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string
    const phone = formData.get("phone") as string

    try {
        // Check if user already exists
        const existing = await sql`
      SELECT id FROM customers WHERE email = ${email}
    ` as Customer[]

        if (existing.length > 0) {
            return { success: false, error: "Email already registered" }
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10)

        // Create customer
        const customers = await sql`
      INSERT INTO customers (email, password_hash, name, phone_number)
      VALUES (${email}, ${passwordHash}, ${name}, ${phone})
      RETURNING id
    ` as Customer[]

        const customerId = customers[0].id

        // Migrate session wishlist to new account
        await migrateWishlistToAccount(customerId)

        // Return success with credentials for client-side signIn
        return { success: true, email, password }
    } catch (error) {
        console.error("Registration error:", error)
        return { success: false, error: "Failed to create account" }
    }
}

export async function createAccountFromOrder(data: {
    email: string
    password: string
    referenceCode: string
    name?: string
}) {
    try {
        // Check if user exists
        const existing = await sql`
      SELECT id FROM customers WHERE email = ${data.email}
    ` as Customer[]

        if (existing.length > 0) {
            return { success: false, error: "Email already registered" }
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 10)

        // Create customer
        const customers = await sql`
      INSERT INTO customers (email, password_hash, name)
      VALUES (${data.email}, ${passwordHash}, ${data.name || data.email.split('@')[0]})
      RETURNING id
    ` as Customer[]

        const customerId = customers[0].id

        // Link the order
        await sql`
      UPDATE orders
      SET customer_id = ${customerId}
      WHERE reference_code = ${data.referenceCode}
    `

        // Migrate session wishlist to new account
        await migrateWishlistToAccount(customerId)

        // Return success with credentials for client-side signIn
        return { success: true, customerId, email: data.email, password: data.password }
    } catch (error) {
        console.error("Account creation error:", error)
        return { success: false, error: "Failed to create account" }
    }
}
