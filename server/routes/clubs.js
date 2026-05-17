const express = require("express");
const router = express.Router();
const Club = require("../models/Club");
const ClubJoinRequest = require("../models/ClubJoinRequest");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// GET all clubs
router.get("/", authMiddleware, async (req, res) => {
  try {
    const clubs = await Club.find();
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE club
router.post("/", async (req, res) => {
  try {
    const club = new Club(req.body);
    await club.save();
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const bcrypt = require("bcryptjs");

// POST /api/clubs/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, description, category, contactNumber } = req.body;
    
    const expectedDomain = `@${name.toLowerCase().replace(/\s+/g, '')}.edu.in`;
    if (!email.endsWith(expectedDomain)) {
      return res.status(400).json({ message: `Club email must end with ${expectedDomain}` });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered for a club or student." });
    }

    // Check if club name already exists
    const existingClub = await Club.findOne({ name });
    if (existingClub) {
      return res.status(400).json({ message: "Club Name already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (club_admin)
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "club_admin",
      clubName: name
    });

    const savedUser = await newUser.save();

    // Create club
    const newClub = new Club({
      name,
      description,
      category,
      members: [email],
      adminId: savedUser._id.toString()
    });

    const savedClub = await newClub.save();

    // Link clubId to the admin user
    savedUser.clubId = savedClub._id;
    await savedUser.save();

    res.status(201).json({ message: "Club registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// REQUEST TO JOIN club
router.post("/request", authMiddleware, async (req, res) => {
  try {
    const { clubId, studentEmail, studentName, clubName } = req.body;

    const user = await User.findOne({ email: studentEmail });
    const studentId = user ? user._id : undefined;

    const existingRequest = await ClubJoinRequest.findOne({
      clubId,
      studentEmail,
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({ message: "You already have a pending request for this club." });
    }

    const request = new ClubJoinRequest({
      studentId,
      clubId,
      clubName,
      studentEmail,
      studentName,
      status: "pending"
    });

    await request.save();
    res.json({ message: "Request sent to club head" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET club requests (for club heads)
router.get("/requests", authMiddleware, async (req, res) => {
  try {
    const { clubName, clubId } = req.query;
    if (req.user.role !== "club_admin") {
      return res.status(403).json({ message: "Access Denied" });
    }
    if (clubId && req.user.clubId && req.user.clubId.toString() !== clubId) {
      return res.status(403).json({ message: "Unauthorized club access" });
    }
    let filter = {};
    if (clubId) {
      filter = { clubId };
    } else if (clubName) {
      filter = { clubName };
    }
    const requests = await ClubJoinRequest.find(filter).sort({ date: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET specific student's requests (for disabling Join buttons)
router.get("/myrequests", authMiddleware, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const requests = await ClubJoinRequest.find({ studentEmail: email });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// APPROVE request
router.put("/requests/:id/approve", authMiddleware, async (req, res) => {
  try {
    const { clubName, clubId } = req.body;
    if (req.user.role !== "club_admin") {
      return res.status(403).json({ message: "Access Denied" });
    }
    if (clubId && req.user.clubId && req.user.clubId.toString() !== clubId) {
      return res.status(403).json({ message: "Unauthorized club access" });
    }
    const request = await ClubJoinRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (clubId && request.clubId.toString() !== clubId) {
      return res.status(403).json({ message: "Unauthorized: You can only approve requests for your own club." });
    } else if (!clubId && clubName && request.clubName !== clubName) {
      return res.status(403).json({ message: "Unauthorized: You can only approve requests for your own club." });
    }

    request.status = "approved";
    await request.save();

    // Add student to club members
    const club = await Club.findById(request.clubId);
    if (club && !club.members.includes(request.studentEmail)) {
      club.members.push(request.studentEmail); // Keeping array for backward compatibility
      await club.save();
    }

    // Generate new dual-identity Club Member Alias Account
    const studentUser = await User.findOne({ email: request.studentEmail });
    if (studentUser) {
      const bcrypt = require("bcryptjs");
      
      // Calculate alias components
      const clubSlug = (club ? club.name : request.clubName).toLowerCase().replace(/[^a-z0-9]/g, "");
      const studentSlug = (studentUser.name || request.studentName).toLowerCase().replace(/[^a-z0-9]/g, "") || request.studentEmail.split("@")[0].replace(/[^a-z0-9]/g, "");
      const generatedEmail = `${studentSlug}@${clubSlug}.edu.in`;
      
      let aliasUser = await User.findOne({ email: generatedEmail, clubId: request.clubId });
      
      if (!aliasUser) {
         const hashedPassword = await bcrypt.hash("member123", 10);
         aliasUser = new User({
            name: `${studentUser.name}`,
            email: generatedEmail,
            password: hashedPassword,
            role: "club_member",
            clubId: request.clubId,
            clubName: club ? club.name : request.clubName
         });
         await aliasUser.save();
      }

      // Create strictly bound ClubMember record natively to the new Alias Identity
      const ClubMember = require("../models/ClubMember");
      const existingMember = await ClubMember.findOne({ userId: aliasUser._id, clubId: request.clubId });
      
      if (!existingMember) {
        const newMember = new ClubMember({
          userId: aliasUser._id,
          clubId: request.clubId,
          role: "club_member"
        });
        await newMember.save();
      }
    }

    res.json({ message: "Request approved and member added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// REJECT request
router.put("/requests/:id/reject", authMiddleware, async (req, res) => {
  try {
    const { clubName, clubId } = req.body;
    if (req.user.role !== "club_admin") {
      return res.status(403).json({ message: "Access Denied" });
    }
    if (clubId && req.user.clubId && req.user.clubId.toString() !== clubId) {
      return res.status(403).json({ message: "Unauthorized club access" });
    }
    const request = await ClubJoinRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (clubId && request.clubId.toString() !== clubId) {
      return res.status(403).json({ message: "Unauthorized: You can only reject requests for your own club." });
    } else if (!clubId && clubName && request.clubName !== clubName) {
      return res.status(403).json({ message: "Unauthorized: You can only reject requests for your own club." });
    }

    request.status = "rejected";
    await request.save();

    res.json({ message: "Request rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET club members
router.get("/:clubId/members", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "club_admin") {
      return res.status(403).json({ message: "Access Denied" });
    }
    if (req.user.clubId && req.user.clubId.toString() !== req.params.clubId) {
      return res.status(403).json({ message: "Unauthorized club access" });
    }

    const ClubMember = require("../models/ClubMember");
    const members = await ClubMember.find({ clubId: req.params.clubId })
      .populate("userId", "name email role")
      .populate("clubId", "name");
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE member from club members logic
router.delete("/:clubId/members/:userId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "club_admin") {
      return res.status(403).json({ message: "Access Denied" });
    }
    if (req.user.clubId && req.user.clubId.toString() !== req.params.clubId) {
      return res.status(403).json({ message: "Unauthorized club access" });
    }

    const { clubId, userId } = req.params;
    const ClubMember = require("../models/ClubMember");

    // Remove from ClubMember Collection
    const deletedMember = await ClubMember.findOneAndDelete({ clubId, userId });
    
    if (!deletedMember) {
      return res.status(404).json({ message: "Member not found in this club." });
    }

    // Downgrade user returning to student
    const User = require("../models/User");
    const user = await User.findById(userId);
    if (user) {
      // Revert them back safely
      user.role = "student";
      user.clubId = undefined;
      user.clubName = undefined;
      await user.save();
      
      const club = await Club.findById(clubId);
      if (club && club.members) {
        club.members = club.members.filter(email => email !== user.email);
        await club.save();
      }

      // Purge identical JoinRequests enforcing consistency
      const ClubJoinRequest = require("../models/ClubJoinRequest");
      await ClubJoinRequest.deleteMany({ studentId: userId, clubId: clubId });
    }

    res.json({ message: "Member successfully removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;