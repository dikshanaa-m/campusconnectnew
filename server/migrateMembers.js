require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const Club = require("./models/Club");
const User = require("./models/User");
const ClubMember = require("./models/ClubMember");

async function migrate() {
  console.log("Starting Robust ClubMembers Migration...");
  
  try {
    await connectDB();
    console.log("Connected to MongoDB.");

    const clubs = await Club.find();
    let totalMigrated = 0;
    let skippedDuplicates = 0;
    let missingUsers = 0;
    let ambiguousUsers = 0;
    let errors = 0;

    for (const club of clubs) {
      if (!club.members || club.members.length === 0) continue;

      for (let identifier of club.members) {
        try {
          if (!identifier) continue;
          
          identifier = identifier.trim();
          if (identifier === "") continue;

          // 1. Try resolving by email (case-insensitive)
          const emailRegex = new RegExp("^" + identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i");
          let users = await User.find({ email: { $regex: emailRegex } });
          let user = null;

          if (users.length === 1) {
            user = users[0];
          } else if (users.length > 1) {
            console.log(`[AMBIGUOUS EMAIL] Multiple users match email: "${identifier}". Skipping.`);
            ambiguousUsers++;
            continue;
          }

          // 2. Fallback resolving by exact name string
          if (!user) {
            const nameRegex = new RegExp("^" + identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i");
            users = await User.find({ name: { $regex: nameRegex } });
            
            if (users.length === 1) {
              user = users[0];
            } else if (users.length > 1) {
              console.log(`[AMBIGUOUS NAME] Multiple users match name: "${identifier}" in club: ${club.name}. Skipping.`);
              ambiguousUsers++;
              continue;
            }
          }

          if (!user) {
            console.log(`[NOT FOUND] User not found for string: "${identifier}" in club: ${club.name}`);
            missingUsers++;
            continue;
          }

          // Duplicate Protection
          const existingMember = await ClubMember.findOne({
            userId: user._id,
            clubId: club._id
          });

          if (existingMember) {
            // Uncomment below if you want verbose logs for duplicates
            // console.log(`[DUPLICATE] User ${user.email} already in ClubMembers. Skipping.`);
            skippedDuplicates++;
            continue;
          }

          // Insert into new ClubMembers Collection
          const newClubMember = new ClubMember({
            userId: user._id,
            clubId: club._id,
            role: "club_member",
            joinedAt: new Date()
          });

          await newClubMember.save();
          console.log(`[SUCCESS] Migrated ${user.email} -> ${club.name}.`);
          totalMigrated++;

        } catch (err) {
          console.error(`[ERROR] Failed to process relation for "${identifier}":`, err);
          errors++;
        }
      }
    }

    console.log("\n================ Migration Summary ================");
    console.log(`Successfully Migrated      : ${totalMigrated}`);
    console.log(`Skipped (Duplicates)       : ${skippedDuplicates}`);
    console.log(`Skipped (Not Found/Invalid): ${missingUsers}`);
    console.log(`Skipped (Ambiguous Match)  : ${ambiguousUsers}`);
    console.log(`Errors Encountered         : ${errors}`);
    console.log("===================================================\n");

  } catch (err) {
    console.error("Migration failed due to a fatal error:", err);
  } finally {
    console.log("Exiting migration process.");
    process.exit(0);
  }
}

migrate();
