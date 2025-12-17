import { writeFile, mkdir } from "fs/promises"
import { NextRequest, NextResponse } from "next/server"
import path from "path"

export async function POST(request: NextRequest) {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
        return NextResponse.json({ success: false, error: "No file provided" })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads")
    try {
        await mkdir(uploadDir, { recursive: true })
    } catch (e) {
        console.error("Error creating upload directory:", e)
    }

    // Create unique filename
    const filename = `${Date.now()}-${file.name.replace(/\s/g, "-")}`
    const filepath = path.join(uploadDir, filename)

    try {
        await writeFile(filepath, buffer)
        return NextResponse.json({ success: true, url: `/uploads/${filename}` })
    } catch (error) {
        console.error("Error saving file:", error)
        return NextResponse.json({ success: false, error: "Failed to save file" })
    }
}
