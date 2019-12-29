const fetch = require("node-fetch")
const btoa = require("btoa")
const io = require("console-read-write")
const express = require("express")
const app = express()
const apiURL = "https://api.vrchat.cloud/api/1/"
const apiKey = "?apiKey=JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26"
const colors = require("colors")
let prompt = require('password-prompt')


global.fetch = fetch
global.Headers = fetch.Headers


let username = null
let password = null
let savedUserName = null
let savedUser = null
let globalrank = null
let endpoint = ""

const fs = require('fs')



let headers = { 'Authorization': 'Basic ' + btoa(username + ':' + password), 'Content-Type': 'raw' }
let headers2 = { 'Authorization': 'Basic ' + btoa(username + ':' + password), 'Content-Type': 'application/json' }


const getbyExactUsername = async() => {
    let end = false;
    do {
        console.log("Please enter username: ")
        let searchuser = await io.read()
        endpoint = "users/" + searchuser + "/name"




        try {
            await fetch(apiURL + endpoint + apiKey, { method: 'GET', headers: headers }, false)
                .then(response => response.json())
                .then((object) => {
                    app.use((err, req, res, next) => {
                        res.status(err.status)
                        res.render('error', { error: err })
                    })
                    var friendstatus = object['isFriend']
                    if (friendstatus === "false") {
                        console.log("Friendship: This Person is not your Friend.")
                    } else if (friendstatus === "true") {
                        console.log("Friendship: This Person is your Friend")
                    }


                    var tags = object['tags']

                    console.log("\n")
                    if (tags == "undefined" || tags == null) {
                        console.log("User not found. Please try again.".red)
                    } else {
                        console.log("This Person has the following rank: ")
                        tagsort(tags)
                        

                        savedUser = object['id']
                        savedUserName = object['displayName']
                        let onlinestate = "undefined";

                        // Colorize Online & Offline state

                        if (object['state'] == 'online') {
                            onlinestate = "online".green
                        } else if (object['state'] == 'offline') {
                            onlinestate = "offline".red
                        } else {
                            onlinestate = "offline".red
                        }

                        console.log("\n")
                        console.log("Current Status: " + "\n" + object['bio'].brightBlue)
                        console.log("\n")
                        console.log("Online-State: " + onlinestate)
                        console.log("Last Login: " + object['last_login'])
                        console.log("Current Location: " + object['location'])
                        console.log("\\(*-*)/ - " + "I saved the userID from " + savedUserName + " for later use.")
                        console.log("\n")
                        console.log("writing result's in webapp..")
                        let outputlocation = object['location'].substring(0, object['location'].length - 6);
                        console.log(outputlocation);
                        app.get("/vrc", function(req, res) {
                            res.send("Avatar Image: " + "<img " + "src='" + object['currentAvatarThumbnailImageUrl'] + "'/>" + "<br/>" + "User: " + savedUserName + "<br/>" + "UserID: " + savedUser + "<br/>" + "Friendship: " + friendstatus + "<br/>" + "Rank: " + globalrank + "<br/>" + "Online - State: " + object['state'] + "<br/>" + "Current Location: " + "<iframe src='" + "https://en.vrcw.net/world/detail/" + outputlocation + "'" + "></iframe>")
                        })
                        end = true;
                    }
                })
        } catch (ex) {
            console.log(ex.message, "User not found. Please try again.");
            end = false;
        }
    } while (end == false)
    console.log("Press anykey to continue..")
    await io.read()
}



const getbyUsername = async() => {
    let end = false;
    do {
        console.log("Please enter username: ")
        let searchuser = await io.read()
        let apiKey = "&apiKey=JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26"
        endpoint = "users" + "?search=" + searchuser
        try {
            await fetch(apiURL + endpoint + apiKey, { method: 'GET', headers: headers }, false)
                .then(response => response.json())
                .then((object) => {
                    app.use((err, req, res, next) => {
                        res.status(err.status)
                        res.render('error', { error: err })
                    })
                        console.log("Showing the first 3 Entry's..".blue + "\n")
                        console.log(object[0])
                        console.log(object[1])
                        console.log(object[2])
                    end = true;
                })
        } catch (ex) {
            console.log(ex.message, "User not found. Please try again.");
            end = false;
        }
    }
    while (end == false)
    console.log("Press anykey to continue..")
    await io.read()
}




let sendmessage = async() => {

    let userid = savedUser
    console.log("Global Username is " + username)
    if (savedUser != "" || savedUser == null) {
        console.log("\\(*-*)/ - I found the userid from " + savedUserName + " do you want to use this id? (y/n)")
        let userchoise = await io.read()
        switch (userchoise.toLowerCase()) {
            case "y":
                userid = savedUser
                console.log("Using the latest ID " + userid + " from user " + savedUserName)
                break
            case "n":
                savedUser = ""
                await sendmessage()
                break
            default:
                userid = savedUser
                console.log("Using the latest ID " + userid + " from user " + savedUserName)
                break
        }
    } else {
        console.log("Please enter target userid: ")

        let end = false
        while (userid.startsWith("usr") == false) {
            let userid = await io.read()
            switch (userid.startsWith("usr")) {
                case true:
                    console.log("UserID accepted.")
                    end = true
                    break
                case false:
                    console.log("UserID rejected. Please enter a correct userID.")
                    end = false
                    break
            }
            if (end == true)
                break
        }
    }

    endpoint = "user/" + userid + "/notification"
    console.log("Please enter the Message you want to send")

    let message = await io.read()

    const data = {
        "apiKey": apiKey.substring(8, apiKey.length),
        "type": "invite",
        "message": "test",
        "details": {
            "worldId": "",
            "worldName": message
        }
    }





    await fetch(apiURL + endpoint + apiKey, { method: "POST", headers: headers2, body: JSON.stringify(data), apiKey: apiKey.substring(8, apiKey.length) })
        .then((response) => response.json())
        .then((json) => console.log(json))
}

async function sendFriendRequest() {
    console.log("Sending Friendrequest to last known user..")
    endpoint = "user/" + savedUser + "/notification?type=friendrequest"


    const data = {
        "apiKey": apiKey.substring(8, apiKey.length),
        "type": "friendRequest",
        "message": ""
    }

    await fetch(apiURL + endpoint + "&" + apiKey.substring(1, apiKey.length), { method: "POST", headers: headers2, body: JSON.stringify(data), apiKey: apiKey.substring(8, apiKey.length) })
        .then(response => response.json())
        .then((object) => {
            console.log(object)
            console.log("I've send an Friend request to: " + savedUserName)
        })
}

async function serverStatus() {
    endpoint = "visits"
    await fetch(apiURL + endpoint + apiKey, { method: "GET", headers: headers }, false)
        .then(response => response.json())
        .then((object) => {
            let usercount = object
            console.log("Online Users: ".green + object);
        });

}








async function whoAmI() {

    endpoint = "auth/user"
    await fetch(apiURL + endpoint + apiKey, { method: "GET", headers: headers })
        .then((response) => response.json())
        .then((json) => {

            console.log("I got the following data: " + "\n")
            console.log("Username: " + json['username'])
            console.log("Displayname: " + json['displayName'])
            console.log("Current Home: " + json['homeLocation'])
            console.log("UserID: " + json['id'])
            console.log("Last Login: " + json['last_login'])
            console.log("\n")


            if (json['bio'] != "") {
                console.log("I found the following biography: " + "\n" + json['bio'].brightBlue + "\n")
            }

            if (json['allowAvatarCopying' === 'true']) {
                console.log("AvatarCloning: is enabled.")
            } else {
                console.log("AvatarCloning: is disabled")
            }

            console.log("Ingame Statusdescription: " + json['statusDescription'].brightGreen)

            let tags = json['tags']


            tagsort(tags)


            if (json['twoFactorAuthEnabled'] === 'true') {
                console.log("You have 2FA enabled.")
            } else {
                console.log("2FA is disabled.")
            }

            console.log("writing data to webapp..")
            app.get("/vrc", function(req, res) {
                res.send("Avatar Image: " + "<br/>" + "<img " + "src='" + json['currentAvatarThumbnailImageUrl'] + "'/>" + "<br/>" + "User: " + json['username'] + "<br/>" + "Displayname: " + json['displayName'] + "<br/>" + "UserID: " + json['id'] + "<br/>" + "Ingame Status: " + json['statusDescription'] + "<br/>" + "Bio: " + json['bio'] + "<br/>" + "Rank: " + globalrank + "<br/>" + "Current Home: " + "<iframe src='" + "https://en.vrcw.net/world/detail/" + json['homeLocation'] + "'" + "></iframe>")
            })

            savedUser = json['id']
            savedUserName = json['displayName']

            console.log("I saved the username " + json['displayName'] + " and the id " + json['id'] + " for later use.")
                //console.log("Got Userdata.")
                //console.log(json[''])
        })
}



async function setStatus() {

    let statusdesc = "";
    console.log("Please enter your new status")
    statusdesc = await io.read();

    if (savedUser == "" || savedUser == null) {
        console.log("I need a userid. Please enter the id or run option 3 before this one.")
        console.log("Enter the id: ")
        savedUser = await io.read()
    }


    endpoint = "users/" + savedUser;

    const data = {
        "statusDescription": statusdesc
    }

    fetch(apiURL + endpoint + apiKey, { method: "PUT", headers: headers2, body: JSON.stringify(data), apiKey: apiKey.substring(8, apiKey.length) })
        .then((response) => response.json())
        .then((json) => {
            console.log("The new Status is: " + json['statusDescription'].green)
        })
}




function tagsort(tags) {

    // Check for null or undefined in IndexOf tags //
    if (tags == "undefined" && tags == null) {
        console.log("Can't show tags for unknown user.");
    }

    if (tags.indexOf("troll") != -1) {
        console.log("This Person is a confirmed troll.".red)
        globalrank = "This Person is a confirmed troll."
    } else if (tags.indexOf("system_legend") != -1) {
        console.log("Legendary User and appears as" + " Trusted User".magenta)
        globalrank = "Legendary User and appears as Trusted User"
    } else if (tags.indexOf("system_trust_legend") != -1) {
        console.log("Veteran User and appears as" + " Trusted User".magenta)
        globalrank = "Veteran User and appears as Trusted User"
    } else if (tags.indexOf("system_trust_veteran") != -1) {
        console.log("Trusted User".magenta)
        globalrank = "Trusted User"
    } else if (tags.indexOf("system_trust_trusted") != -1) {
        console.log("Known User".yellow)
        globalrank = "Known User"
    } else if (tags.indexOf("system_trust_known") != -1) {
        console.log("User".green)
        globalrank = "User"
    } else if (tags.indexOf("system_trust_basic") != -1) {
        console.log("New User".blue)
        globalrank = "New User"
    }
}



async function main() {
    /*
        module.exports = await async function(filePath) {
            let data = fs.readFileSync(filePath).toString() /* open the file as string
    let object = JSON.parse(data) /* parse the string to object 
    return JSON.stringify(object, false, 3) /* use 3 spaces of indentation
} */
    let end = false
    let loggedin = false;

    console.log("APIController by CryptoGamer, this software is open-source.".magenta);
    console.log("Please Login with your VRChat account".green)
    while (loggedin == false) {
        console.log("Username: ")
        username = await io.read()
        password = await prompt('password: ')

        //password = await io.read()


        endpoint = "auth/user"

        try {
            headers = { 'Authorization': 'Basic ' + btoa(username + ':' + password), 'Content-Type': 'raw' }
            await fetch(apiURL + endpoint + apiKey, { method: "GET", headers: headers })
                .then((response) => response.json().catch(error => {
                    console.log('Login failed.'.red)
                }))
                .then((json) => {
                    if (json['username'] == null) {
                        throw new Error("Login failed. Please enter correct login details".red)
                        loggedin = false;
                    } else {
                        console.log("You are logged in as " + json['username'])
                        loggedin = true;
                        headers = { 'Authorization': 'Basic ' + btoa(username + ':' + password), 'Content-Type': 'raw' }
                        headers2 = { 'Authorization': 'Basic ' + btoa(username + ':' + password), 'Content-Type': 'application/json' }
                    }
                })
        } catch (error) {
            console.log("Login failed.".red)
            end = true
        }
    }
    let server = app.listen(3000, 'localhost', function() {
        console.log("APIController listening on port 3000!")
            //console.log("... port %d in %s mode", app.address().port, app.settings.env);
    })

    while (end == false) {
        console.log("1. Search for exact username")
        console.log("2. Search by Username")
        console.log("3. SendMessage to a user by ID")
        console.log("4. My Account information")
        console.log("5. Set Status description")
        console.log("6. Get Server Status")
        console.log("7. Send Friend Request")
        console.log("8. End Program")

        const options = await io.read()
        switch (options) {
            case "1":
                await getbyExactUsername()
                break
            case "2":
                await getbyUsername()
                break
            case "3":
                await sendmessage()
                break
            case "4":
                await whoAmI()
                break
            case "5":
                await setStatus()
                break
            case "6":
                await serverStatus()
                break
            case "7":
                await sendFriendRequest()
                break
            case "8":
                end = true
                server.close()
                break
        }
    }
}




main()