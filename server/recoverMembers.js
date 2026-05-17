require("dotenv").config();
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const User = require("./models/User");
const Club = require("./models/Club");
const ClubMember = require("./models/ClubMember");
const ClubJoinRequest = require("./models/ClubJoinRequest");

const recoverMembers = async () => {
  try {
    await connectDB();
    console.log("Analyzing approved join requests for missing ClubMember bindings...");

    const approvedRequests = await ClubJoinRequest.find({ status: "approved" });
    let recoveredCount = 0;

    for (const request of approvedRequests) {
      // Find the associated user account
      const user = await User.findOne({ email: request.studentEmail });
      
      if (user) {
        // Enforce their presence in the ClubMember database architecture natively
        const existingMember = await ClubMember.findOne({ userId: user._id, clubId: request.clubId });
        
        if (!existingMember) {
          const newMember = new ClubMember({
            userId: user._id,
            clubId: request.clubId,
            role: user.role === "club_admin" ? "club_admin" : "club_member"
          });
          await newMember.save();
          recoveredCount++;
          console.log(`[RECOVERED] Synced user ${user.email} into ClubMember for club: ${request.clubName}`);
        }

        // Repair any loose string array bindings for backward compatibility logic
        const club = await Club.findById(request.clubId);
        if (club && !club.members.includes(user.email)) {
          club.members.push(user.email);
          await club.save();
        }

        // Hard-set user club pointers strictly
        if (user.role === "student") {
           user.role = "club_member";
        }
        if (!user.clubId) {
           user.clubId = request.clubId;
           user.clubName = request.clubName;
           await user.save();
        }
      } else {
        console.log(`[WARN] Original user for request ${request.studentEmail} cannot be found anymore.`);
      }
    }

    console.log(`\nSuccessfully bridged and recovered ${recoveredCount} missing member records.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration fatal fault:", error);
    process.exit(1);
  }
};

recoverMembers();
