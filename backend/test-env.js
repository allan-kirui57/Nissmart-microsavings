require('dotenv').config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('DB') || key.includes('DATABASE')));
