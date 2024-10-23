import express from "express";
import jwt from "jsonwebtoken";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const app = express();
const PORT = 8001;

const JWT_SECRET = "jdsabcaihsdbcuasjlbecu";

//middlewares
// this middleware provides us the access of body
app.use(express.json());

const users = [];



//AUTHENTICATIOn middleware
const auth = (req, res, next) => {
    const token = req.headers.authorization;

    if(token) {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if(err) {
                res.status(401).json({
                    message:"unauthorized",
                    success: false
                });
            }
            else {
                req.user = decoded;
                next();
            }
        })
    } 
    else {
        res.status(404).json({
            message:"token not found",
            success:false
        });
    }
}

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ... existing code ...

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "public", "index.html"));
})


//REGISTRATION BUSINESS LOGIC
app.post('/signup', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    //checking if user already exist or not
    const userExist = users.find(user => user.username === username);
    if(userExist) {
        return res.status(400).json({
            message: "user already exist",
            success: false
        });
    }

    //strong data into users array
    users.push({
        username,
        password
    });

    return res.status(200).json({
        message: "Signup successful !!!",
        success: true
    });
});


//LOGIN BUSINESS LOGIC
app.post('/signin', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    //verify user
    const userFound = users.find(user => user.username === username && user.password === password);

    if(userFound) {
        const token = jwt.sign({username: userFound.username}, JWT_SECRET);
        userFound.token = token;
        // res.json({
        //     token
        // });
        console.log(users)
    } 
    else {
        return res.status(404).json({
            message: "user not found, enter valid credentials",
            success: false
        })
    }

    return res.status(200).json({
        message:"Signin successfull",
        success: true
    });
})

//endpoint -> "/me"
app.get('/me', auth, (req, res) => {  
    const user = req.user;

    if(!user) {
        return res.status(401).json({
            message: "User is not authorized",
            success: false
        });
    }

    return res.status(200).json({
        message:`Welcome ${user.username}`,
        success: true
    });
});

app.listen(PORT, () => {
    console.log(`app is listening on port: ${PORT}`);
})