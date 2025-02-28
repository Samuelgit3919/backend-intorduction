const express = require("express")
const db = require("better-sqlite3")("ourApp.db")

db.pragma("journal_mode = WAL")

// database setup here

const createTables = db.transaction(() => {
    db.prepare(
        `
            CREATE TABLE IF NOT EXISTS users (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             username STRING NOT NULL UNIQUE,
             password STRING NOT NULL
            )
        `).run()
})

createTables()


const app = express()
const port = 3001

app.set("view engine", "ejs")
app.use(express.urlencoded({extended: false}))
app.use(express.static('public'))

app.use(function (req, res, next) {
    res.locals.errors = []
    next()
})

app.get("/", (req, res) => {
    res.render("homepage")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.post('/register', (req, res) => {
    const errors = []

    if(typeof req.body.username !== "string") req.body.username=""
    if (typeof req.body.password !== "string") req.body.password = ""
    
    req.body.username = req.body.username.trim()

    if (!req.body.username) errors.push("you must provide a username")
    if (req.body.username && req.body.username.length < 3) errors.push("username must have at least 3 characters")
    if (req.body.username && req.body.username.length > 10) errors.push("the length of username must not exceed 10 characters.")
    if (req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("username only contains letters and numbers")
    
    
     if (!req.body.password) errors.push("you must provide a password")
    if (req.body.password && req.body.password.length < 3) errors.push("password must have at least 3 characters")
    if (req.body.password && req.body.password.length > 10) errors.push("the length of password must not exceed 10 characters.")

    if (errors.length) {
        return res.render("homepage", {errors})
    } else {
        res.send("Thank you for filling out the form")
    }


    //   save the new user into database

    const ourStatement = db.prepare("INSERT INTO users (username,password) VALUE (?,?) ")
    
    ourStatement.run(req.body.username, req.body.password)

    // log the user in by giving them a cookie


}) 


app.listen(port)