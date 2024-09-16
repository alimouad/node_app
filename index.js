const express = require("express");
// const path = require("path");
const collection = require("./src/config");
const bcrypt = require('bcrypt');

const app = express();
// convert data into json format
app.use(express.json());
// Static file
app.use(express.static("public"));
// app.use(express.static(path.join(__dirname, "js")));

app.use(express.urlencoded({ extended: false }));


//use EJS as the view engine
app.set("view engine", "ejs");



app.get("/login", (req, res) => {
    res.render("../views/login.ejs");
});

app.get("/signup", (req, res) => {
    res.render("../views/signup.ejs");
});

// // Register User
app.post("/signup", async (req, res) => {

    const data = {
        name: req.body.username,
        password: req.body.password,
        password2: req.body.password2
    }
    
    // Check if the username already exists in the database
    const existingUser = await collection.findOne({ name: data.name });

    if (existingUser) {
        res.status(400).send("Wrong email or password !");
        
    }
    if (data.password2 !== data.password ) {
        res.status(400).send("Passwords do not match !");
    }
    else {
        // Hash the password using bcrypt
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword; // Replace the original password with the hashed one

        const userdata = await collection.insertMany(data);
      
        // 
        res.status(201).send("Registered successfully!");
        console.log(userdata);
    }

});

// Login user 
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            res.status(400).send("Wrong email or password !");
            
        }
        // Compare the hashed password from the database with the plaintext password
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            res.status(400).send("Wrong email or password !");
           
        }
        else {
            
            res.render("main");
        }
    }
    catch {
        res.status(500).send({ message: err.message });
       
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));