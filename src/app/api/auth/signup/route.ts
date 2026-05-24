import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Create the auth user (auto-confirmed, no email verification)
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const userId = data.user?.id
  if (!userId) {
    return NextResponse.json({ error: 'User created but ID missing' }, { status: 500 })
  }

  // Create profile rows manually — bypasses the trigger entirely
  await supabaseAdmin
    .from('user_profiles')
    .upsert({ id: userId, email }, { onConflict: 'id' })

  await supabaseAdmin
    .from('food_preferences')
    .upsert({
      user_id: userId,
      cuisine_types: [],
      dietary_flags: [],
      disliked_ingredients: [],
      max_cook_time_mins: 60,
      allergens: [],
    }, { onConflict: 'user_id' })

  return NextResponse.json({ success: true })
}
