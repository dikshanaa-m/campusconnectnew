const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/campusconnect').then(async () => {
  const db = mongoose.connection.db;
  const clubs = await db.collection('clubs').find({}).toArray();
  const fs = require('fs');
  fs.writeFileSync('clubs_output.json', JSON.stringify(clubs, null, 2));
  process.exit(0);
}).catch(console.error);
