const mongoose = require("mongoose");
const path = require("path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const app = express();
require("./config/passport")(passport);


//Database connection
const db = "mongodb+srv://user:1234@tsechacks22.xasft.mongodb.net/InterviewScheduler?retryWrites=true&w=majority";
mongoose.connect(db)
.then(
    () => console.log("Connected to MongoDB Atlas")
).catch(
    (e) => console.log(e)
);


app.use(expressLayouts);

//setting view engine to ejs
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
// app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({extended: false}));

//express session
app.use
(
    session
    (
        {
            secret: "ZLYQXpMP9KifnRvE4VvS",
            resave: true,
            saveUninitialized: true
        }
    )
);
//passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Routes
app.use("/", require("./routes/index.js"));



//Connection to port
const PORT = process.env.PORT || 5000;
app.listen
(
    PORT,
    (err) =>{
        if(err)
            throw err;
        console.log(`Server started on PORT ${PORT}...`);
    }
);