require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const Club = require("./models/Club");

const syncAdmins = async () => {
  try {
    await connectDB();
    const users = await User.find({ clubId: { $ne: null } });
    
    let promoted = 0;
    let demoted = 0;
    let skipped = 0;

    for (const user of users) {
      if (!user.clubId) continue;
      
      const club = await Club.findById(user.clubId);
      if (!club) {
        skipped++;
        continue;
      }

      // Exact Database ownership marking
      const isPrimaryAdmin = club.adminId && club.adminId.toString() === user._id.toString();

      // Rule 1: Promote explicitly marked owners back up
      if (isPrimaryAdmin && user.role !== "club_admin") {
        user.role = "club_admin";
        await user.save();
        console.log(`[PROMOTED] UserId (${user._id}) -> club_admin (Owner of: ${club.name})`);
        promoted++;
      } 
      // Rule 2: Demote imposters avoiding string dependency rules natively
      else if (!isPrimaryAdmin && user.role === "club_admin") {
        user.role = "club_member";
        await user.save();
        console.log(`[DEMOTED] UserId (${user._id}) -> club_member (Not the Primary Owner of: ${club.name})`);
        demoted++;
      } 
      // Rule 3: Skipped unchanged elements
      else {
        skipped++;
      }
    }

    console.log(`\n--- Synchronization Complete ---`);
    console.log(`Promoted Users: ${promoted}`);
    console.log(`Demoted Users:  ${demoted}`);
    console.log(`Skipped Users:  ${skipped}`);
    process.exit(0);
  } catch (err) {
    console.error("Synchronization failed:", err);
    process.exit(1);
  }
};

syncAdmins();
