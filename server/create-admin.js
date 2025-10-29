import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import crypto from 'crypto';

async function createAdminUser() {
  const db = await open({
    filename: '../demo.db',
    driver: sqlite3.Database
  });

  // Create admin user
  const adminEmail = 'admin@rajeshsweets.com';
  const adminPassword = 'admin123';
  const hash = crypto.createHash('sha256').update(adminPassword).digest('hex');
  const id = 'u_admin_' + Date.now().toString(36);
  const created_at = new Date().toISOString();

  try {
    await db.run('INSERT INTO users (id, email, password, is_admin, created_at) VALUES (?, ?, ?, ?, ?)', 
      id, adminEmail, hash, 1, created_at);
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 Admin ID:', id);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      console.log('⚠️  Admin user already exists');
    } else {
      console.log('❌ Error creating admin user:', err.message);
    }
  }

  await db.close();
}

createAdminUser().catch(console.error);
