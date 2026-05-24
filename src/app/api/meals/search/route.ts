import { NextResponse } from 'next/server'
// Spoonacular integration removed
export async function GET() { return NextResponse.json({ error: 'Not available' }, { status: 410 }) }
