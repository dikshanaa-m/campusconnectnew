const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/campusconnect').then(async () => {
    const db = mongoose.connection.db;
    
    // Find Photography Club
    const club = await db.collection('clubs').findOne({ name: 'Photography Club' });
    if (!club) {
        console.log("Photography Club not found.");
        process.exit(0);
    }

    // 1. Reset all users who were purely members back to 'student' (Leaves 'club_admin' safely untouched)
    const updatedUsers = await db.collection('users').updateMany(
        { clubName: 'Photography Club', role: 'club_member' },
        { $set: { role: 'student' }, $unset: { clubName: "", clubId: "" } }
    );
    console.log(`Reset ${updatedUsers.modifiedCount} user roles to student.`);

    // 2. Clear members array inside the Club document natively
    const updatedClub = await db.collection('clubs').updateOne(
        { _id: club._id },
        { $set: { members: [] } }
    );
    console.log(`Emptied members array inside club document.`);

    // 3. Delete their old join requests entirely so they can cleanly re-apply
    const deletedReqs = await db.collection('clubjoinrequests').deleteMany({ clubId: club._id });
    console.log(`Deleted ${deletedReqs.deletedCount} old join requests for this club.`);

    console.log("Successfully removed all standard members from the Photography Club database.");
    process.exit(0);
}).catch(console.error);
