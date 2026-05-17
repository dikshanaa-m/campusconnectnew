require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const ClubMember = require("./models/ClubMember");

const fixMissingMembers = async () => {
    try {
        await connectDB();
        const sam = await User.findOne({ email: "sam@alexadevelopersclub.edu.in" });
        if (sam) {
            const existing = await ClubMember.findOne({ userId: sam._id });
            if (!existing) {
                const member = new ClubMember({
                    userId: sam._id,
                    clubId: sam.clubId,
                    role: "club_member"
                });
                await member.save();
                console.log("Successfully migrated Sam to ClubMember logic!");
            } else {
                console.log("Sam is already in ClubMember.");
            }
        }
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

fixMissingMembers();
