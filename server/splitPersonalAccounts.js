require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Club = require("./models/Club");
const ClubMember = require("./models/ClubMember");
const bcrypt = require("bcryptjs");

const executeSplit = async () => {
    try {
        await connectDB();
        console.log("Analyzing existing ClubMember pool for legacy personal accounts...");

        const members = await ClubMember.find().populate("userId");
        let alteredCount = 0;

        for (const member of members) {
            const originalUser = member.userId;
            
            // Skip properly mapped alias logic bindings and admins
            if (!originalUser || !originalUser.email.endsWith("@srmist.edu.in") || originalUser.role === "club_admin") {
                 continue;
            }

            console.log(`\nSplitting legacy student account: ${originalUser.email}`);

            const club = await Club.findById(member.clubId);
            if (!club) continue;

            const clubSlug = club.name.toLowerCase().replace(/[^a-z0-9]/g, "");
            const studentSlug = originalUser.name.toLowerCase().replace(/[^a-z0-9]/g, "") || originalUser.email.split("@")[0].replace(/[^a-z0-9]/g, "");
            const generatedEmail = `${studentSlug}@${clubSlug}.edu.in`;

            let aliasUser = await User.findOne({ email: generatedEmail, clubId: club._id });
            
            if (!aliasUser) {
                const hashedPassword = await bcrypt.hash("member123", 10);
                aliasUser = new User({
                    name: `${originalUser.name}`,
                    email: generatedEmail,
                    password: hashedPassword,
                    role: "club_member",
                    clubId: club._id,
                    clubName: club.name
                });
                await aliasUser.save();
                console.log(`  -> Forged new official identity: ${generatedEmail}`);
            }

            // Repoint the ClubMember schema directly to the alias avoiding future collisions
            member.userId = aliasUser._id;
            await member.save();

            // Safely downgrade the personal email restoring standard student operations natively
            originalUser.role = "student";
            originalUser.clubId = undefined;
            originalUser.clubName = undefined;
            await originalUser.save();
            
            alteredCount++;
        }

        console.log(`\nSuccessfully isolated and generated ${alteredCount} completely distinct dual-identities!`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

executeSplit();
