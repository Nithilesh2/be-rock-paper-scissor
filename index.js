import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import bcrypt from "bcrypt"
import connectDB from "./db/index.js"
import User from "./model/user.model.js"

const app = express()

app.use(express.json())
app.use(cors())

dotenv.config({
  path: "./.env",
})

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server is running on port " + process.env.PORT)
    })
  })
  .catch((err) => {
    console.error(err)
  })

//get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find()
    return res.status(200).json(users)
  } catch (error) {
    return res.status(500).json({ message: `failed to get data : ${error}` })
  }
})

//login
app.post("/login", async (req, res) => {
  const { email, password } = req.body

  try {
    const checkMail = await User.findOne({ email: email })
    if (!checkMail) {
      return res.status(404).json({ message: "Email not found" })
    }

    const checkPass = await bcrypt.compare(password, checkMail.password)

    if (!checkPass) {
      return res.status(409).json({ message: "Invalid password" })
    }
    return res.status(200).json({
      message: "Login successful",
      userId: checkMail._id,
      userEmail: checkMail.email,
      userHistory: checkMail.history,
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Getting Error while login", error: error })
  }
})

//Register

app.post("/register", async (req, res) => {
  const { email, password } = req.body

  const checkMail = await User.findOne({ email: email })
  if (checkMail) {
    return res.status(409).json({ message: "Email already exists" })
  }

  const salt = 10
  const hashedPassword = await bcrypt.hash(password, salt)

  const newUser = new User({
    email,
    password: hashedPassword,
  })

  try {
    await newUser.save()
    res.status(201).json({
      message: "User registered successfully",
      userId: newUser.id,
      userEmail: newUser.email,
    })
  } catch (error) {
    res
      .status(500)
      .json({ message: "Getting error while registering", error: error })
  }
})

//send score to history

app.post("/game/sendHistory/:userId", async (req, res) => {
  const { userScore, botScore } = req.body
  const { userId } = req.params

  try {
    const status = userScore > botScore ? "win" : "lose"
    const historyEntry = {
      score: userScore,
      status,
      datePlayed: new Date(),
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.history.push(historyEntry)

    await user.save()

    res.status(200).json({ message: "Game history saved successfully" })
  } catch (error) {
    console.error("Error saving game history:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// to get the user's game history
app.get("/game/getHistory/:id", async (req, res) => {
  const { id } = req.params

  try {
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    return res.json(user.history)
  } catch (err) {
    return res.status(500).json({ error: "Server error" })
  }
})
