const bcrypt = require('bcryptjs');
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const passport = require("passport");
const { checkAuthentication, checkLogin } = require("../config/authentication");
const User = require("../models/user");


router.get(
    "/",
    checkLogin,
    (req, res) => {
        res.render("homepage");
    }
);

router.get(
    "/login",
    checkLogin,
    (req, res) => {
        res.render("login");
    }
)

router.post(
    "/login",
    checkLogin,
    (req, res, next) => {
        passport.authenticate
            (
                'local',
                {
                    successRedirect: '/dashboard',
                    failureRedirect: '/login',
                    failureFlash: true
                }
            )(req, res, next);
    }
)

router.get(
    "/register",
    checkLogin,
    (req, res) => {
        res.render("register");
    }
)

router.post(
    "/register",
    checkLogin,
    (req, res, next) => {
        const { username, password, email } = req.body;

        let errors = []

        if (!username)
            errors.push("Please enter an username")
        if (!password)
            errors.push("Please enter a password")
        if (!email)
            errors.push("Please enter an email")

        if (errors.length > 0)
            res.render(
                "register", {
                errors,
                username,
                email,
                password
            }
            );

        else {
            User.findOne(
                {
                    email: email
                }
            ).then(
                (user) => {
                    if (user) {
                        errors.push("That email has been used")
                        res.render(
                            "register",
                            {
                                errors,
                                username,
                                email,
                                password
                            }
                        );
                    }
                    else {
                        const newUser = new User
                            (
                                {
                                    username,
                                    email,
                                    password
                                }
                            )

                        bcrypt.hash(
                            newUser.password,
                            10,
                            (err, hash) => {
                                if (err)
                                    throw err;

                                newUser.password = hash;
                                newUser.save().then(
                                    (user, req) => {
                                        res.redirect("/login")
                                    }
                                )
                            }
                        );
                    }


                }
            )
        }
    }
)

router.get(
    '/logout',
    checkAuthentication,
    (req, res) => {
        req.logOut();
        res.redirect("/");
    }
)

router.get(
    "/dashboard",
    checkAuthentication,
    (req, res) => {
        res.render("dashboard");
    }
)

router.post(
    "/calendar",
    (req, res) => {

        // Require google from googleapis package.
        const { google } = require('googleapis')

        // Require oAuth2 from our google instance.
        const { OAuth2 } = google.auth

        // Create a new instance of oAuth and set our Client ID & Client Secret.
        const oAuth2Client = new OAuth2('767650045138-cq6pi2qgj5dq9t60gn8gjevcp24hb3f6.apps.googleusercontent.com', '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')


        // Call the setCredentials method on our oAuth2Client instance and set our refresh token.
        oAuth2Client.setCredentials({
            refresh_token: '1//04xTlF1Ly6IQ7CgYIARAAGAQSNwF-L9IrSF9EuqggkGuQHlBJGYLUR4RyHRyrjlqI4VVvbyG2CB15V8RDEEC9iTOQXLg7TeKgwF8',
        })

        // Create a new calender instance.
        const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

        // Create a new event start date instance for temp uses in our calendar.
        var eventStartTime = new Date()
        eventStartTime = req.body.eventStarttime + ":00.52z";

        // Create a new event end date instance for temp uses in our calendar.
        var eventEndTime = new Date()
        eventEndTime = req.body.eventEndtime + ":00.52z";

        console.log(req.body.eventStarttime)
        // console.log(req.body.eventEndtime)

        console.log(eventStartTime)
        // console.log(eventEndTime)
        const summary = req.body.summary
        const description = req.body.description
        // Create a dummy event for temp uses in our calendar
        const event = {
            summary: summary,
            location: description,
            colorId: 1,
            start: {
                dateTime: eventStartTime,
                timeZone: 'Asia/Jakarta',
            },
            end: {
                dateTime: eventEndTime,
                timeZone: 'Asia/Jakarta',
            },
        }

        // Check if we a busy and have an event on our calendar for the same time.
        calendar.freebusy.query(
            {
                resource: {
                    timeMin: eventStartTime,
                    timeMax: eventEndTime,
                    timeZone: 'Asia/Jakarta',
                    items: [{ id: 'primary' }],
                },
            },
            (err, res) => {
                // Check for errors in our query and log them if they exist.
                if (err) return console.error('Free Busy Query Error: ', err)

                // Create an array of all events on our calendar during that time.
                const eventArr = res.data.calendars.primary.busy

                // Check if event array is empty which means we are not busy
                if (eventArr.length === 0)
                    // If we are not busy create a new calendar event.
                    return calendar.events.insert(
                        { calendarId: 'primary', resource: event },
                        err => {
                            // Check for errors and log them if they exist.
                            if (err) return console.error('Error Creating Calender Event:', err)
                            // Else log that the event was created.
                            console.log('Calendar event successfully created.')
                            // res.send("Slot has been scheduled and mail to the interviewee has been sent")
                            const nodemailer = require('nodemailer');

                            const mailer = 'newbiesthealgorithmic@gmail.com';

                            let mailTransporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: mailer,
                                    pass: 'Thealgo@212'
                                }
                            });

                            let mailDetails = {
                                from: mailer,
                                to: req.body.email,
                                subject: req.body.summary,
                                text: "You have been allocated time : from " + req.body.eventStarttime + " to " + req.body.eventEndtime
                            };

                            mailTransporter.sendMail(mailDetails, function (err, data) {
                                if (err) {
                                    console.log('Error Occurs ' + err);
                                } else {
                                    console.log('Email sent successfully');
                                    res.send("Time slot has been successfully alloted and respective mail have been sent");
                                }
                            });
                        }
                        
                    )

                // If event array is not empty log that we are busy.
                return console.log(`Sorry I'm busy...`)
            }
        )
    }
)

router.get(
    "/dashboard/addInterview",
    checkAuthentication,
    (req, res) => {
        res.render("interviewform");
    }
)


module.exports = router;