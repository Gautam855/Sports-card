const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const equalsIdx = trimmed.indexOf('=')
      if (equalsIdx !== -1) {
        const key = trimmed.substring(0, equalsIdx).trim()
        let val = trimmed.substring(equalsIdx + 1).trim()
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1)
        }
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}

loadEnvFile(path.resolve(__dirname, '../.env.local'))
loadEnvFile(path.resolve(__dirname, '../.env'))

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment.")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log("Checking profiles table...")
  const email = "sportslnv560@gmail.com".toLowerCase()
  const rawPassword = "SportsLnv@560"
  const displayName = "Faizan"
  let username = "faizan"
  const role = "editor"

  // Check if user with this email already exists
  const { data: existingUser, error: checkError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (checkError) {
    console.error("Error checking existing user:", checkError)
    process.exit(1)
  }

  const password_hash = await bcrypt.hash(rawPassword, 12)

  if (existingUser) {
    console.log("User already exists with this email:", existingUser)
    console.log("Updating role, password, and display name...")
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        role: role,
        password_hash: password_hash
      })
      .eq('id', existingUser.id)
      .select('*')
      .single()

    if (updateError) {
      console.error("Update error:", updateError)
      process.exit(1)
    }
    console.log("User updated successfully:", updatedUser)
  } else {
    // Check if username is taken
    const { data: existingUsername } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle()

    if (existingUsername) {
      username = "faizan560"
    }

    console.log(`Creating new user: email=${email}, username=${username}, display_name=${displayName}, role=${role}`)
    const { data: newUser, error: insertError } = await supabase
      .from('profiles')
      .insert({
        email: email,
        username: username.toLowerCase(),
        display_name: displayName,
        password_hash: password_hash,
        role: role
      })
      .select('*')
      .single()

    if (insertError) {
      console.error("Insert error:", insertError)
      process.exit(1)
    }
    console.log("New user created successfully:", newUser)
  }
}

main()
