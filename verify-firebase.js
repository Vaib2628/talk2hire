// Quick script to verify Firebase environment variables are set
// Run with: node verify-firebase.js

const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

console.log('🔍 Checking Firebase environment variables...\n');

const missing = [];
const present = [];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.includes('your_') || value === '') {
    missing.push(varName);
    console.log(`❌ ${varName}: NOT SET`);
  } else {
    present.push(varName);
    // Show first few characters for verification
    const preview = value.substring(0, 10) + '...';
    console.log(`✅ ${varName}: ${preview}`);
  }
});

console.log('\n' + '='.repeat(50));

if (missing.length === 0) {
  console.log('✅ All Firebase environment variables are set!');
  console.log('\n💡 If you still see errors:');
  console.log('   1. Make sure .env.local is in the project root');
  console.log('   2. Restart your Next.js dev server');
  console.log('   3. Clear .next cache: rm -rf .next (or delete .next folder)');
} else {
  console.log(`❌ Missing ${missing.length} environment variable(s)`);
  console.log('\n📝 To fix:');
  console.log('   1. Create .env.local in your project root');
  console.log('   2. Copy variables from env.example');
  console.log('   3. Add your Firebase credentials from: https://console.firebase.google.com/');
  console.log('   4. Restart your dev server');
  process.exit(1);
}

