const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/campusconnect').then(async () => {
  const db = mongoose.connection.db;
  
  const admins = await db.collection('users').find({ role: 'club_admin' }).toArray();
  const clubs = await db.collection('clubs').find().toArray();
  const requests = await db.collection('clubjoinrequests').find().toArray();

  const fs = require('fs');
  fs.writeFileSync('debug_state.json', JSON.stringify({ admins, clubs, requests }, null, 2));
  
  process.exit(0);
}).catch(console.error);
