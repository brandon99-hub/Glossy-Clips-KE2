import { sql, type Product } from "@/lib/db"
import { ProductsManager } from "./products-manager"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Products | Admin",
}

export default async function AdminProductsPage() {
    const cookieStore = await cookies()
    const isLoggedIn = cookieStore.get("admin_session")

    if (!isLoggedIn) {
        redirect("/admin/login")
    }

    const products = (await sql`
    SELECT * FROM products ORDER BY created_at DESC
  `) as Product[]

    return (
        <div className="p-6 md:p-8">
            <ProductsManager products={products} />
        </div>
    )
}
