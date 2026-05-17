const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/campusconnect').then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({ role: { $in: ['club_member', 'club'] } }).toArray();
  const fs = require('fs');
  fs.writeFileSync('users_output.json', JSON.stringify(users, null, 2));
  process.exit(0);
}).catch(console.error);
