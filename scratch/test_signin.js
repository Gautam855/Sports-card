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

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSignIn() {
  const email = "sportslnv560@gmail.com"
  const password = "SportsLnv@560"

  const { data: user, error } = await supabase
    .from('profiles')
    .select('id, email, username, display_name, role, password_hash')
    .eq('email', email.toLowerCase())
    .single()

  if (error || !user) {
    console.error("User not found:", error)
    return
  }

  const isValid = await bcrypt.compare(password, user.password_hash)
  console.log("Sign-in test result:", {
    found: true,
    email: user.email,
    username: user.username,
    display_name: user.display_name,
    role: user.role,
    passwordMatches: isValid
  })
}

testSignIn()
