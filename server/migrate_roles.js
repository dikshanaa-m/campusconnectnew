const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/campusconnect').then(async () => {
  const db = mongoose.connection.db;
  // Migrate all existing 'club_member' accounts (which currently act as admins) to 'club_admin'
  const result = await db.collection('users').updateMany(
    { role: 'club_member' },
    { $set: { role: 'club_admin' } }
  );
  console.log(`Migrated ${result.modifiedCount} accounts to club_admin.`);
  process.exit(0);
}).catch(console.error);
