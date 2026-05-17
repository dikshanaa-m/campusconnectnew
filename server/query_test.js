const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/campusconnect').then(async () => {
  await mongoose.connection.collection('users').updateOne(
    { email: 'admin@nss.edu.in' },
    { $set: { clubName: 'NSS (National Service Scheme)' } }
  );
  console.log('Reverted NSS Head to original long string');
  process.exit(0);
});
