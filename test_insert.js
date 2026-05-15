const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function run() {
  console.log("Testing insert into news_categories...")
  const { data, error } = await supabase.from('news_categories').insert({
    name: 'Test Category',
    slug: 'test-category-' + Date.now(),
    color: '#000000'
  }).select()
  
  if (error) {
    console.error("Insert Error:", error)
  } else {
    console.log("Insert Success:", data)
  }
}

run()
