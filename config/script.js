
(function runhojaa() {
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
    const eventStartTime = new Date()
    eventStartTime.setDate(eventStartTime.getDay() + 6)
    eventStartTime.setHours(eventStartTime.getHours() + 6)

    // Create a new event end date instance for temp uses in our calendar.
    const eventEndTime = new Date()
    eventEndTime.setDate(eventEndTime.getDay() + 6)
    var timerequired = 60;
    eventEndTime.setHours(eventEndTime.getHours() + 1 + 6)

    // Create a dummy event for temp uses in our calendar
    const event = {
        summary: `Meeting with David`,
        location: `3595 California St, San Francisco, CA 94118`,
        description: `Meet with David to talk about the new client project and how to integrate the calendar for booking.`,
        colorId: 1,
        start: {
            dateTime: eventStartTime,
            timeZone: 'Asia/Kolkata',
        },
        end: {
            dateTime: eventEndTime,
            timeZone: 'Asia/Kolkata',
        },
    }

    // Check if we a busy and have an event on our calendar for the same time.
    calendar.freebusy.query(
        {
            resource: {
                timeMin: eventStartTime,
                timeMax: eventEndTime,
                timeZone: 'Asia/Kolkata',
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
                        return console.log('Calendar event successfully created.')
                    }
                )

            // If event array is not empty log that we are busy.
            return console.log(`Sorry I'm busy...`)
        }
    )

    // var cal = CalendarApp.getCalendarById(id);
    //   var events = cal.getEvents(startTime, endTime);
    //   for ( var i in events ) {
    //     var id = events[i].getId();
    //   }

    // const getrequest = calendar.events.get(
    //   {calendarId:'primary',eventId: 'primary'}
    // )

    // console.log(getrequest.data)
})();



