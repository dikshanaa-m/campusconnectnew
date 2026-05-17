const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Club = require("./models/Club");
const User = require("./models/User");

const getSlug = (name) => {
  if (name === "Google Developer Student Club" || name === "GDSC") return "gdsc";
  if (name === "Microsoft Innovations Club") return "microsoft";
  if (name === "National Service Scheme" || name === "NSS") return "nss";
  return name.toLowerCase().replace(/\s+/g, '');
};

const connectDB = require("./config/db");

const runMigration = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected");

    const clubs = await Club.find();
    console.log(`Found ${clubs.length} clubs checking for missing club_admin roles...`);

    for (const club of clubs) {
      // Duplicate Check
      const existingAdmin = await User.findOne({ clubId: club._id, role: "club_admin" });
      if (existingAdmin) {
        console.log(`[SKIP] Admin already mapped for club: ${club.name} -> ${existingAdmin.email}`);
        continue;
      }

      const slug = getSlug(club.name);
      const generatedEmail = `lead@${slug}.edu.in`;
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      const newAdmin = new User({
        name: `${club.name} Admin`,
        email: generatedEmail,
        password: hashedPassword,
        role: "club_admin",
        clubId: club._id,
        clubName: club.name
      });

      await newAdmin.save();
      console.log(`[SUCCESS] Generated club_admin for ${club.name} -> ${generatedEmail}`);
    }

    console.log("Full script generated correctly! Exiting execution.");
    process.exit(0);
  } catch (err) {
    console.error("Critical failure during User propagation:", err);
    process.exit(1);
  }
};

runMigration();
