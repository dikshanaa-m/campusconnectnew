const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/campusconnect').then(async () => {
  const db = mongoose.connection.db;
  const requests = await db.collection('clubjoinrequests').find().toArray();
  const fs = require('fs');
  fs.writeFileSync('reqs_output.json', JSON.stringify(requests, null, 2));
  process.exit(0);
}).catch(console.error);
