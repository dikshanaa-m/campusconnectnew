const express = require("express")
const router = express.Router()

const Student = require("../models/Student")


// LOGIN

router.post("/login", async (req, res) => {

  const { email, password } = req.body

  try {

    const user = await Student.findOne({
      email: email.toLowerCase().trim(),
      password: password.trim()
    })

    if (!user) {

      return res.status(400).json({
        message: "Invalid student login"
      })

    }

    res.json(user)

  }
  catch (err) {

    console.log(err)
    res.status(500).json(err)

  }

})

module.exports = router