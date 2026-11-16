const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkLogin() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  const passwords = ['Mahajobs@7058', 'Admin@123', 'admin123', 'Wasim@123', 'Password123!', '123456'];
  for (const p of passwords) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'wasimhavaldar70@gmail.com',
      password: p
    });
    if (!error && data.user) {
      console.log('SUCCESS! Password is:', p);
      return;
    }
  }
  console.log('None of the default passwords matched.');
}

checkLogin().catch(console.error);

