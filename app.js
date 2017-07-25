/* jshint node: true, devel: true */
'use strict';
 
const
  bodyParser = require('body-parser'),
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),  
  request = require('request'),
  http = require('http'),
  parseString = require('xml2js').parseString,
  routes = require('./routes/index'),
  app = express(),
  multer = require('multer'),
  path = require('path'),
  moment = require('moment-timezone'),
  cron = require('node-cron');

//Bodyparser middleware
app.use(bodyParser.urlencoded({ extended: false}));

//Throws errors if callbacks are not from facebook
//{ verify: verifyRequestSignature } deleted from function because it throws errors if JSON.parse function is called
app.use(bodyParser.json());

// para CORN
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Setting port
app.set('port', process.env.PORT || 8000);

//Setting view engine
app.set('view engine', 'ejs');

//Set Public folder as static folder
app.use(express.static('public'));

// le dice a express que el directorio 'uploads', es estatico.
app.use("/uploads", express.static(path.join(__dirname, 'uploads')));

//Use ./routes/index.js as routes root /
app.use('/', routes);



//Global variables
//Data recieved from the sendXmlPostRequest request to Channelmanager
var resultTransferData = [];

var doppelzimmerClassicSteinleo = "<RatePlanCandidate RatePlanType=\"11\" RatePlanID=\"420424\"/>";
var einzelzimmerSommerstein = "<RatePlanCandidate RatePlanType=\"11\" RatePlanID=\"420596\"/>";
var doppelzimmerDeluxeHolzleo = "<RatePlanCandidate RatePlanType=\"11\" RatePlanID=\"420590\"/>";
var doppelzimmerSuperiorSteinleo = "<RatePlanCandidate RatePlanType=\"11\" RatePlanID=\"420592\"/>";
var numberOfPersons = 0;
var numberOfRooms = 0;
var count = 0;
var arrivalDateMonth = 0;
var arrivalDateDay = 0;
var arrivalDateDayCalculations = 0;
var arrivalDateMonthCalculations = 0;
var numberOfRoomsSplitted = [];
var numberOfPersonsSplitted = [];
var arrivalDayDateSplitted = [];
var arrivalDate = 0;
var departureDate = 0;
var i = 0;
var stayRange = 0;
var arrivalDateSplitted = [];
var departureDateSplitted = [];
var priceAllNightsDoppelzimmerDeluxeHolzleo = 0;
var priceAllNightsDoppelzimmerSuperiorSteinleo = 0;
var priceAllNightsEinzelzimmerSommerstein = 0;
var priceAllNightsDoppelzimmerClassicSteinleo = 0;
var january = 31;
var february = 28;
var march = 31;
var april = 30;
var may = 31;
var june = 30;
var july = 31;
var august = 31;
var september = 30;
var oktober = 31;
var november = 30;
var december = 31;
var monthDays = 0;
var daysInFirstMonth = 0;
var daysInSecondMonth = 0;
var secondMonth = 0;
var daysInSecondMonthCount = 0;
var daysInFirstMonthCount = 0;
var daysInAllTwoMonths = [];
var daysInFirstMonthDisplay = [];
var daysInSecondMonthDisplay = [];
var arrivalFirstDateMonthDisplay = [];
var arrivalSecondDateMonthDisplay = [];
var arrivalAllTwoMonthsDisplay = [];
var hotelIsClosed = false;
var bookingLink = "";
var departureDateForLink = "";
var arrivalDateForLink = "";
var dateIsInThePast = false;
var autoAnswerIsOn = true;
var senderIDTransfer = [];
var newFileUploaded = false;
exports.newFileUploaded = false;

//data when user clicks send to messenger button -> send to index.js REST-API
var a = {};
//object a stringified in order to make post request to REST-API
var b = "";
// c = messageData.recipient.id; called in updateDb function -> if sendAPI call failes
var c = "";

//Store uploaded files - destination set / name of file set
var storage = multer.diskStorage({
    // Destination of upload
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    // Rename of file
    filename: function (req, file, cb) {
        cb(null, Math.random() + "*" + file.originalname.replace(/ /g, ""));
    }
});

var upload = multer({ storage: storage });

//local variables are declared globally, assigned a value in sendGenericMessageOfferX function
app.locals.titleSummary = "";
app.locals.subTitleSummary = "";
app.locals.titleSummary2 = "";
app.locals.subTitleSummary2 = "";
app.locals.titleSummaryDoppelzimmerSuperiorSteinleo = "";
app.locals.subTitleSummaryDoppelzimmerSuperiorSteinleo = "";
app.locals.titleSummaryDoppelzimmerClassicSteinleo = "";
app.locals.subTitleSummaryDoppelzimmerClassicSteinleo = "";
app.locals.totalPrice = "";
app.locals.totalPrice = 0;


/*
 * If setting up a new app, change SERVER_URL and PAGE_ACCESS_TOKEN according to config.js file
 */

/*
 * Be sure to setup your config values before running this code. You can 
 * set them using environment variables or modifying the config file in /config.
 *
 */

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ? 
  process.env.MESSENGER_APP_SECRET :
  config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');

// URL where the app is running (include protocol). Used to point to scripts and 
// assets located at this address. 
const SERVER_URL = (process.env.SERVER_URL) ?
  (process.env.SERVER_URL) :
  config.get('serverURL');

//Used in receivedAuthentication function
const HOTEL_NAME = config.get('hotelName');

// HOST_URL used for DB calls - SERVER_URL without https or https://
const HOST_URL = config.get('hostURL');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
  console.error("Missing config values");
  process.exit(1);
}

//source: https://gist.github.com/aitoribanez/8b2d38601f6916139f5754aae5bcc15f
//New file got attached to message
app.post("/upload", upload.array("uploads[]", 12), function (req, res) {
    console.log("console log in app.post upload", 'files', req.files);
    exports.uploadedFileName = req.files[0].filename;
    newFileUploaded = true;
    //Export value to index.js - a new file got uploaded
    exports.newFileUploaded = newFileUploaded;
    res.send(req.files);

    /*

    // An object of options to indicate where to post to
    var put_options = {
        //Change URL on top if deploying
        host: HOST_URL,
        port: '80',
        path: '/guests',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    // Set up the request
    var put_req = http.request(put_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: of put request - line 2540 + chunk var (deleted): ');
        });
    });

    // post the data
    put_req.write(c);
    put_req.end();
*/
});

/*
 * Use your own validation token. Check that the token used in the Webhook
 * setup is the same token used here.
 *
 */
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page.
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook', function (req, res) {
  var data = req.body;
    console.log("/webhook to app.post called -> Calls signature error?" + data);
  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else if (messagingEvent.read) {
          receivedMessageRead(messagingEvent);
        } else if (messagingEvent.account_linking) {
          receivedAccountLink(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});


/*
 * This path is used for account linking. The account linking call-to-action
 * (sendAccountLinking) is pointed to this URL.
 *
 */
app.get('/authorize', function(req, res) {
  var accountLinkingToken = req.query.account_linking_token;
  var redirectURI = req.query.redirect_uri;

  // Authorization Code should be generated per user by the developer. This will
  // be passed to the Account Linking callback.
  var authCode = "1234567890";

  // Redirect users to this URI on successful login
  var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

  res.render('authorize', {
    accountLinkingToken: accountLinkingToken,
    redirectURI: redirectURI,
    redirectURISuccess: redirectURISuccess
  });
});

/*
cron.schedule('0-59 * * * * *', function(){
    console.log('running a task every second');
});
*/

//Function called in receivedMessage
//send XML post request to Cultswitch channel manager. Recieved data is pushed to resultTransferData
function sendXmlPostRequest(numberOfRooms, numberOfPersons, arrivalDate, departureDate, doppelzimmerClassicSteinleo, einzelzimmerSommerstein, doppelzimmerDeluxeHolzleo, doppelzimmerSuperiorSteinleo) {

    var buffer = '';
    var postRequest = {
        hostname: "cultswitch.cultuzz.de",
        path: "/cultswitch/processOTA",
        method: "POST",
        port: 8080,
        headers: {
            'Cookie': 'cookie',
            'Content-type': 'application/x-www-form-urlencoded'
        }
    };
        var body = 'otaRQ=<?xml version="1.0" encoding="UTF-8"?>' +
            '<OTA_HotelAvailRQ xmlns="http://www.opentravel.org/OTA/2003/05" Version="3.30" TimeStamp="2011-07-12T05:59:49" PrimaryLangID="de">' +
            '<POS><Source AgentSine="49082" AgentDutyCode="513f3eb9b082756f">' +
            '<RequestorID Type="10" ID="50114" ID_Context="CLTZ"/>' +
            '<BookingChannel Type="7"/>' +
            '</Source></POS>' +
            '<AvailRequestSegments>' +
            '<AvailRequestSegment ResponseType="RateInfoDetails" InfoSource="MyPersonalStay">' +
            '<StayDateRange Start="' + arrivalDate + '" End="' + departureDate + '"/>' +
            '<RatePlanCandidates>' +
            doppelzimmerClassicSteinleo + einzelzimmerSommerstein + doppelzimmerDeluxeHolzleo + doppelzimmerSuperiorSteinleo +
            '</RatePlanCandidates><RoomStayCandidates><RoomStayCandidate Quantity="' + numberOfRooms + '">' +
            '<GuestCounts>' +
            '<GuestCount AgeQualifyingCode="10" Count="' + numberOfPersons + '"/>' +
            '<GuestCount Age="10" Count="10"/>' +
            '</GuestCounts>' +
            '</RoomStayCandidate>' +
            '</RoomStayCandidates>' +
            '</AvailRequestSegment>' +
            '</AvailRequestSegments>' +
            '</OTA_HotelAvailRQ>';

        var req = http.request(postRequest, function (res) {
        console.log(res.statusCode);
        res.on("data", function (data) {
            buffer += data;
            console.log(buffer);
        });
        res.on("end", function () {
            parseString(buffer, function (err, result) {
                console.log(result);
                (JSON.stringify(result));
                resultTransferData.push(result);
            });
        });
    });
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });
    req.write(body);
    req.end();
}


/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];
  console.log("Req headers: (In verifyRequestSignature function");
  console.log(req.headers);
    console.log("Signature:" + signature);
  if (!signature) {
    // For testing, let's log an error. In production, you should throw an 
    // error.
    console.error("Couldn't validate the signature. Line 358 app.js // Callback from Facebook. If Server URL is not the same as webhook URL on facebook // Every callback is parsed in the bodyparser on top - Line 20 - so errors in logs are because of - but are not a problem");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to 
 * Messenger" plugin, it is the 'data-ref' field. Read more at 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */

//Recieve authentication from wlanlandingpage when user click Send to messenger button - Send data to mongoDB database.
function receivedAuthentication(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfAuth = event.timestamp;
    // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
    // The developer can set this to an arbitrary value to associate the
    // authentication callback with the 'Send to Messenger' click event. This is
    // a way to do account linking when the user clicks the 'Send to Messenger'
    // plugin.
    var passThroughParam = event.optin.ref;

    console.log("Received authentication for user %d and page %d with pass " +
        "through param '%s' at %d", senderID, recipientID, passThroughParam,
        timeOfAuth);

    //https://stackoverflow.com/questions/5643321/how-to-make-remote-rest-call-inside-node-js-any-curl
    var buffer = "";
    var optionsget = {
        host: 'graph.facebook.com',
        port: 443,
        path: '/v2.6/' + senderID +
        '?fields=first_name,last_name,profile_pic,is_payment_enabled,locale,timezone,gender&access_token=' +
        PAGE_ACCESS_TOKEN,
        method: 'GET'
    };

    console.info('Options prepared:');
    console.info(optionsget);
    console.info('Do the GET call');

    // do the GET request to retrieve data from the user's graph API
    var reqGet = https.request(optionsget, function (res) {
        console.log("statusCode: ", res.statusCode);
        // uncomment it for header details
        // console.log("headers: ", res.headers);

        res.on('data', function (d) {
            console.info('GET result:\n');
            process.stdout.write(d);
            buffer += d;
            //parse buffer to JSON object
            a = JSON.parse(buffer);
            // When an authentication is received, we'll send a message back to the sender
            // to let them know it was successful.
            sendTextMessage(senderID, "Hallo " +  a.first_name + " " + a.last_name + "! Sie haben sich erfolgreich angemeldet. " +
                "Sie erhalten nun Neuigkeiten via Facebook Messenger " +
                "von Ihrem " + HOTEL_NAME +  " team. Viel Spaß!");
            //Additionally senderID is added to the Javascript object, which is saved to the MongoDB
            a["senderId"] = senderID;
            //User is a "Angemeldeter Gast" and is able to receive messages
            a["signed_up"] = true;
            var time = moment().tz('Europe/Vienna').format();
            var time2 = time.replace(/T/gi, " | ");
            var time3 = time2.slice(0, -6);
            a["signed_up_at"] = time3;
            //Parse JSON object to JSON string
            b = JSON.stringify(a);
        });
    });
    // Build the post string from an object
    reqGet.end();
    reqGet.on('error', function (e) {
    console.error("Error line 450:" + e);
    });

    setTimeout(postNewUserToDB, 15000);
}
//New User is saved in DB, function called in receivedAuthentication - send to index.js /guests REST-FUL API
function postNewUserToDB() {
        // An object of options to indicate where to post to
        var post_options = {
            //Change URL to hotelmessengertagbag.herokuapp.com if deploying
            host: HOST_URL,
            port: '80',
            path: '/guests',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // Set up the request
        var post_req = http.request(post_options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('Response: ' + chunk);
            });
        });

        // post the data
        post_req.write(b);
        post_req.end();
}
//Not in use right now
function getAnalytics(){
    var buffer = "";
    var a = "";
    var optionsget = {
        host: 'graph.facebook.com',
        port: 443,
        path: '/v2.8/me/insights/page_messages_active_threads_unique&access_token=EAAUv40NW3zMBAIpTPoI73Q8mvPtZAZBQEi3usOTD6pZAZCSNZApFVictpz74mhIQOOyZAHM2UrNKbc8hk8NhGaSnEJYrQCKwMd7ZAIkoWZCsimnFUAamsQiNOP6dC2PhLvOsOPatn0fWvxXpCPltvU8INNj3vfBBjNG7S1VlPFTDwgZDZD',
        method: 'GET'
    };

    console.info('Options prepared:');
    console.info(optionsget);
    console.info('Do the GET call');

// do the GET request
    var reqGet = https.request(optionsget, function(res) {
        console.log("statusCode: ", res.statusCode);
        // uncomment it for header details
        //  console.log("headers: ", res.headers);

        res.on('data', function(d) {
            console.info('GET result:\n');
            process.stdout.write(d);
            buffer += d;
            console.log(buffer);
            a = JSON.parse(buffer);
            console.log(a);
        });
    });

    reqGet.end();
    reqGet.on('error', function(e) {
        console.error(e);
    });
}
//Stay range is the difference between arrivalday and departureday
function calculateStayRange(arrivalDate, departureDate) {
    arrivalDateSplitted = arrivalDate.split("-");
    departureDateSplitted = departureDate.split("-");
    console.log("Abreisedatum Tag:" + departureDateSplitted[2]);
    console.log("Anreisedatum Tag:" + arrivalDateSplitted[2]);
    console.log(typeof departureDateSplitted[2]);
    console.log("Tage des Monats: " + monthDays);
    if(parseInt(departureDateSplitted[2]) > parseInt(arrivalDateSplitted[2])) {
        console.log("Tag der Abreise ist kleiner als Tag der Anreise Schleife (1)");
        stayRange = parseInt(departureDateSplitted[2] - arrivalDateSplitted[2]);
    } else{
        console.log("Tag der Abreise ist kleiner als Tag der Anreise Schleife (2)");
        stayRange = (monthDays - parseInt(arrivalDateSplitted[2])) + parseInt(departureDateSplitted[2]);
    }
    console.log("Stay Range: " + stayRange);
}
//Price is multiplied by the number of days the stay is long(stayRange), parsed to an integer and added to the initialised variable.
function calculatePrice(stayRange, numberOfRooms) {
    console.log("DoppelzimmerDeluxeHolzleo: " + priceAllNightsDoppelzimmerDeluxeHolzleo + " | DoppelzimmerSuperiorSteinleo: " + priceAllNightsDoppelzimmerSuperiorSteinleo + " | EinzelzimmerSommerstein: " + priceAllNightsEinzelzimmerSommerstein + " | DoppelzimmerClassicSteinleo: " + priceAllNightsDoppelzimmerClassicSteinleo);
    console.log("Stay range: " + stayRange);
    for (i = 0; i < stayRange; i++) {
        priceAllNightsEinzelzimmerSommerstein += parseInt(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[1].Rates[0].Rate[i].Base[0].$.AmountAfterTax);
        priceAllNightsDoppelzimmerSuperiorSteinleo += parseInt(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[1].RoomRates[0].RoomRate[1].Rates[0].Rate[i].Base[0].$.AmountAfterTax);
        priceAllNightsDoppelzimmerClassicSteinleo += parseInt(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[2].RoomRates[0].RoomRate[3].Rates[0].Rate[i].Base[0].$.AmountAfterTax);
        priceAllNightsDoppelzimmerDeluxeHolzleo += parseInt(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[2].RoomRates[0].RoomRate[1].Rates[0].Rate[i].Base[0].$.AmountAfterTax);
            console.log("DoppelzimmerDeluxeHolzleo: " + priceAllNightsDoppelzimmerDeluxeHolzleo + " | DoppelzimmerSuperiorSteinleo: " + priceAllNightsDoppelzimmerSuperiorSteinleo + " | EinzelzimmerSommerstein: " + priceAllNightsEinzelzimmerSommerstein + " | DoppelzimmerClassicSteinleo: " + priceAllNightsDoppelzimmerClassicSteinleo);
        }
    console.log("AFTER NUMBER OF NIGHTS MULTIPLICATION: DoppelzimmerDeluxeHolzleo: " + priceAllNightsDoppelzimmerDeluxeHolzleo + " | DoppelzimmerSuperiorSteinleo: " + priceAllNightsDoppelzimmerSuperiorSteinleo + " | EinzelzimmerSommerstein: " + priceAllNightsEinzelzimmerSommerstein + " | DoppelzimmerClassicSteinleo: " + priceAllNightsDoppelzimmerClassicSteinleo);
    console.log("Number of rooms: " + numberOfRooms);
    // The price is multiplied by the number of rooms indicated by the user
        if (numberOfRooms > 1) {
            priceAllNightsDoppelzimmerDeluxeHolzleo *= numberOfRooms;
            priceAllNightsDoppelzimmerSuperiorSteinleo *= numberOfRooms;
            priceAllNightsEinzelzimmerSommerstein *= numberOfRooms;
            priceAllNightsDoppelzimmerClassicSteinleo *= numberOfRooms;
        }
    console.log(" AFTER NUMBER OF ROOMS MULTIPLICATION: DoppelzimmerDeluxeHolzleo: " + priceAllNightsDoppelzimmerDeluxeHolzleo + " | DoppelzimmerSuperiorSteinleo: " + priceAllNightsDoppelzimmerSuperiorSteinleo + " | EinzelzimmerSommerstein: " + priceAllNightsEinzelzimmerSommerstein + " | DoppelzimmerClassicSteinleo: " + priceAllNightsDoppelzimmerClassicSteinleo);


    exports.priceAllNightsDoppelzimmerSuperiorSteinleo = priceAllNightsDoppelzimmerSuperiorSteinleo;
    exports.priceAllNightsDoppelzimmerClassicSteinleo = priceAllNightsDoppelzimmerClassicSteinleo;
    exports.priceAllNightsDoppelzimmerDeluxeHolzleo = priceAllNightsDoppelzimmerDeluxeHolzleo;
}
//Creating a booking Link, which links to the booking engine on www.salzburgerhof.eu website -
// https://hotel-salzburgerhof.viomassl.com/de/zimmer-angebote/anfrage
// -> Called in receivedMessage function -> Used in sendPaymentButton function
function createBookingLink(arrivalDateSplitted, departureDateSplitted, numberOfPersons){
    console.log("ArrivaldateSplitted : " + arrivalDateSplitted + "Departuredate splitted :" + departureDateSplitted);
    arrivalDateForLink = arrivalDateSplitted[2] + "." + arrivalDateSplitted[1] + "." + arrivalDateSplitted[0];
    departureDateForLink = departureDateSplitted[2] + "." + departureDateSplitted[1] + "." + departureDateSplitted[0];
    console.log(arrivalDateForLink);
    console.log(departureDateForLink);
    bookingLink = "https://hotel-salzburgerhof.viomassl.com/de/zimmer-angebote/anfrage/vsc.php?calendar_date_from=" + arrivalDateForLink +
        "&calendar_date_to=" + departureDateForLink +
        "&persons_adults=" + numberOfPersons +
        "&submitbook=Suchen&step=roomtypes&page=2.page1&PHPSESSID=fif62okvks52atf111b8a237v4";
}
//If request is bigger than 2, the basic arguments for the request are reset. Function called in receivedMessage function on line 761 after -> quickReplyPayload === "1 person" ...
function resetData(){
    count++;
    if (count >= 1) {
        stayRange = 0;
        numberOfPersonsSplitted[0] = 0;
        numberOfRoomsSplitted[0] = 0;
        numberOfRooms = 0;
        numberOfPersons = 0;
        arrivalDate = 0;
        departureDate = 0;
        resultTransferData = [];
        monthDays = 0;
        daysInFirstMonth = 0;
        daysInSecondMonth = 0;
        secondMonth = 0;
        daysInSecondMonthCount = 0;
        daysInFirstMonthCount = 0;
        daysInAllTwoMonths = [];
        daysInFirstMonthDisplay = [];
        daysInSecondMonthDisplay = [];
        arrivalFirstDateMonthDisplay = [];
        arrivalSecondDateMonthDisplay = [];
        arrivalAllTwoMonthsDisplay = [];
        priceAllNightsDoppelzimmerDeluxeHolzleo = 0;
        priceAllNightsDoppelzimmerSuperiorSteinleo = 0;
        priceAllNightsEinzelzimmerSommerstein = 0;
        priceAllNightsDoppelzimmerClassicSteinleo = 0;
        arrivalDateForLink = "";
        departureDateForLink = "";
        bookingLink = "";
        app.locals.titleSummary = "";
        app.locals.subTitleSummary = "";
        app.locals.totalPrice = 0;
    }
}
//Function called in receivedMessage
function assigningNumberOfPersonsVar(quickReplyPayload){
    numberOfPersonsSplitted = quickReplyPayload.split(" ");
    numberOfPersons = parseInt(numberOfPersonsSplitted[0]);
    exports.numberOfPersons = numberOfPersons;
}
//Function called in receivedMessage
function assigningNumberOfRoomsVar(quickReplyPayload) {
    numberOfRoomsSplitted = quickReplyPayload.split(" ");
    console.log("Number of rooms splitted: " + numberOfRoomsSplitted);
    numberOfRooms = parseInt(numberOfRoomsSplitted[0]);
    console.log("Number of rooms INT: " + numberOfRooms);
    exports.numberOfRooms = numberOfRooms;
}
//Function called in receivedMessage
function assigningNumberOfMonthsVar(quickReplyPayload) {
    arrivalDateMonth = quickReplyPayload;
    arrivalDateMonthCalculations = parseInt(arrivalDateMonth);
}
//Function called in receivedMessage
function assigningArrivalDateVar(quickReplyPayload) {
    arrivalDayDateSplitted = quickReplyPayload.split(" ");
    arrivalDateDay = arrivalDayDateSplitted[1];
    arrivalDateDayCalculations = parseInt(arrivalDayDateSplitted[1]);
    arrivalDate = "2017-" + arrivalDateMonth + "-" + arrivalDateDay;
    exports.arrivalDate = arrivalDate;
}
//Function called in receivedMessage
function createDepartureDateSuggestion(){
    console.log(arrivalDateMonthCalculations);
    if(arrivalDateMonthCalculations === 1) {
        monthDays = january;
    } else if (arrivalDateMonthCalculations === 2) {
        monthDays = february;
    } else if (arrivalDateMonthCalculations === 3) {
        monthDays = march;
    } else if (arrivalDateMonthCalculations === 4) {
        monthDays = april;
    } else if (arrivalDateMonthCalculations === 5) {
        monthDays = may;
    } else if (arrivalDateMonthCalculations === 6) {
        monthDays = june;
    } else if (arrivalDateMonthCalculations === 7) {
        monthDays = july;
    } else if (arrivalDateMonthCalculations === 8) {
        monthDays = august;
    } else if (arrivalDateMonthCalculations === 9) {
        monthDays = september;
    } else if (arrivalDateMonthCalculations === 10) {
        monthDays = oktober;
    } else if (arrivalDateMonthCalculations === 11) {
        monthDays = november;
    } else if (arrivalDateMonthCalculations === 12) {
        monthDays = december;
    }
    daysInFirstMonth = monthDays - arrivalDateDayCalculations;
    console.log(daysInFirstMonth);
    console.log(arrivalDateMonthCalculations);
    if (daysInFirstMonth > 12) {
        for (daysInFirstMonthCount = (arrivalDateDayCalculations + 1); daysInFirstMonthCount <= (arrivalDateDayCalculations + 12); daysInFirstMonthCount++) {
            console.log(daysInFirstMonthCount);
            daysInFirstMonthDisplay.push(daysInFirstMonthCount);
            arrivalFirstDateMonthDisplay.push(arrivalDateMonthCalculations);
            daysInFirstMonth = 12;
        }
    } else {
        for (daysInFirstMonthCount = (arrivalDateDayCalculations + 1); daysInFirstMonthCount <= monthDays; daysInFirstMonthCount++) {
            console.log(daysInFirstMonthCount);
            daysInFirstMonthDisplay.push(daysInFirstMonthCount);
            arrivalFirstDateMonthDisplay.push(arrivalDateMonthCalculations);
        }
    }
    console.log(daysInFirstMonthDisplay);
    console.log(arrivalFirstDateMonthDisplay);
    console.log(daysInFirstMonth);
    daysInSecondMonth = 12 - daysInFirstMonth;
    console.log(daysInSecondMonth);
    secondMonth = arrivalDateMonthCalculations + 1;
    console.log(secondMonth);
    for (daysInSecondMonthCount = 1; daysInSecondMonthCount < daysInSecondMonth; daysInSecondMonthCount++) {
        console.log(daysInSecondMonthCount);
        daysInSecondMonthDisplay.push(daysInSecondMonthCount);
        arrivalSecondDateMonthDisplay.push(secondMonth);
    }
    console.log(daysInSecondMonthDisplay);
    console.log(arrivalSecondDateMonthDisplay);
    daysInAllTwoMonths = daysInFirstMonthDisplay.concat(daysInSecondMonthDisplay);
    arrivalAllTwoMonthsDisplay = arrivalFirstDateMonthDisplay.concat(arrivalSecondDateMonthDisplay);
    console.log(daysInAllTwoMonths);
    console.log(arrivalDateDayCalculations);
    console.log(arrivalDateMonthCalculations);
    console.log(arrivalDateMonth);
    console.log(arrivalDate);
}
//Function called in receivedMessage
function assignDepartureDateVar(quickReplyPayload){
    departureDate = quickReplyPayload;
    console.log("Departure Date: " + departureDate);
    exports.departureDate = departureDate;
}
//Function called in receivedMessage
function checkIfDateIsInPast(senderID){
    var d = new Date();
    var f = JSON.stringify(d);
    var i = f.match(/.{1,11}/g);
    var g = i[0];
    while(g.charAt(0) === '"')
    {
        g = g.substr(1);
    }
    var j = g.split("-");
    var h = arrivalDate.split("-");
    if (h[0] < j[0] || h[1] <= j[1] && h[2] < j[2] ) {
        setTimeout(sendErrorMessageNoRoom, 1500, senderID);
        dateIsInThePast = true;
    } else {
        dateIsInThePast = false;
    }
}
//If hotel is closed or if there are no availabilities the rest of the receivedMessage is not executed
function checkIfHotelIsClosed(senderID) {
    console.log(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[1].Rates[0].Rate[0].Base[0].$.AmountAfterTax);
    if (parseInt(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[1].Rates[0].Rate[0].Base[0].$.AmountAfterTax) > 1000 || (parseInt(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[1].Rates[0].Rate[0].Base[0].$.AmountAfterTax) === 999.00 || resultTransferData === "undefined")) {
        console.log("Hotel is closed or fully booked!");
        setTimeout(sendErrorMessageNoRoom, 1500, senderID);
        hotelIsClosed = true;
    } else {
        hotelIsClosed = false;
    }
}
//Export senderID (Exported to index.js / exportSenderID function used on lin 750 & 335
function exportSenderID(senderID){
    console.log("Exporting senderID " + senderID);
    senderIDTransfer.push(senderID);
    console.log(senderIDTransfer);
    exports.senderIDTransfer = senderIDTransfer;
    exports.senderID = senderID;
}


/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message'
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
 *
 * For this example, we're going to echo any text that we get. If we get some
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've
 * created. If we receive a message with an attachment (image, video, audio),
 * then we'll simply confirm that we've received the attachment.
 *
 */

//------>Main function where most answer functions are called from<------
function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;
    console.log("Received message for user %d and page %d at %d with message:",
        senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));
    var isEcho = message.is_echo;
    var messageId = message.mid;
    var appId = message.app_id;
    var metadata = message.metadata;

    //You may get a text or attachment but not both
    var messageText = message.text;
    var messageAttachments = message.attachments;
    var quickReply = message.quick_reply;

    if (isEcho) {
        //Just logging message echoes to console
        console.log("Received echo for message %s and app %d with metadata %s",
            messageId, appId, metadata);
        return;

    } else if (quickReply) {
        var quickReplyPayload = quickReply.payload;
        console.log("Quick reply for message %s with payload %s",
            messageId, quickReplyPayload);
        //First question is how many persons are joining the requested stay.
        if (quickReplyPayload === "1 person" || quickReplyPayload === "2 persons" || quickReplyPayload === "3 persons" || quickReplyPayload === "4 persons" || quickReplyPayload === "5 persons") {
            //Every request is counted.
            //If request is bigger than 2, the basic arguments for the request are reset.
            resetData();
            //indicated value (how many persons are joining) from the user is added to the numberOfPersons variable
            assigningNumberOfPersonsVar(quickReplyPayload);
            //Number of rooms is the next question
            sendRoomRequest(senderID);
        } else if (quickReplyPayload === "1 room" || quickReplyPayload === "2 rooms" || quickReplyPayload === "3 rooms" || quickReplyPayload === "4 rooms" || quickReplyPayload === "5 rooms") {
            //indicated value (how many rooms) from the user is added to the numberOfRooms variable
            //Arrival month is next question
            assigningNumberOfRoomsVar(quickReplyPayload);
            sendArrivalDateMonth(senderID);
        } else if (quickReplyPayload === "mehr1") {
            //all monthbubbles are not fitting in one question
            sendArrivalDateMonth2(senderID);
        } else if (quickReplyPayload === "01" || quickReplyPayload === "02" || quickReplyPayload === "03" || quickReplyPayload === "04" || quickReplyPayload === "05" || quickReplyPayload === "06" || quickReplyPayload === "07" || quickReplyPayload === "08" || quickReplyPayload === "09" || quickReplyPayload === "10" || quickReplyPayload === "11" || quickReplyPayload === "12") {
            //indicated value (which months is the arrival) from the user is added to the arrivalDateMonth variable
            assigningNumberOfMonthsVar(quickReplyPayload);
            //Next question is which day the user arrives
            sendArrivalDay(senderID);
        } else if (quickReplyPayload === "mehr2") {
            //all daybubbles are not fitting in one question
            sendArrivalDay2(senderID);
        } else if (quickReplyPayload === "mehr3") {
            //all daybubbles are not fitting in one question
            sendArrivalDay3(senderID);
        } else if (quickReplyPayload === "d 01" || quickReplyPayload === "d 02" || quickReplyPayload === "d 03" || quickReplyPayload === "d 04" || quickReplyPayload === "d 05" || quickReplyPayload === "d 06" || quickReplyPayload === "d 07" || quickReplyPayload === "d 08" || quickReplyPayload === "d 09" || quickReplyPayload === "d 10" || quickReplyPayload === "d 11" || quickReplyPayload === "d 12" || quickReplyPayload === "d 13" || quickReplyPayload === "d 14" || quickReplyPayload === "d 15" || quickReplyPayload === "d 16" || quickReplyPayload === "d 17" || quickReplyPayload === "d 18" || quickReplyPayload === "d 19" || quickReplyPayload === "d 20" || quickReplyPayload === "d 21" || quickReplyPayload === "d 22" || quickReplyPayload === "d 23" || quickReplyPayload === "d 24" || quickReplyPayload === "d 25" || quickReplyPayload === "d 26" || quickReplyPayload === "d 27" || quickReplyPayload === "d 28" || quickReplyPayload === "d 29" || quickReplyPayload === "d 30" || quickReplyPayload === "d 31") {
            //arrival Day Date is splitted, day is saved in arrivalDateDay variable. Int is saved in arrivalDateDayCalculations varible, whcih is used for stay-range calculations. Arrival date is a string.
            assigningArrivalDateVar(quickReplyPayload);
            //departure date is created and sent to the use
            createDepartureDateSuggestion();
            sendDepartureDateSuggestion(senderID);
        } else if (quickReplyPayload === "2017-" + arrivalAllTwoMonthsDisplay[0] + "-" + daysInAllTwoMonths[0] || quickReplyPayload === "2017-" + arrivalAllTwoMonthsDisplay[1] + "-" + daysInAllTwoMonths[1] || quickReplyPayload === "2017-" + arrivalAllTwoMonthsDisplay[2] + "-" + daysInAllTwoMonths[2] || quickReplyPayload === "2017-" + arrivalAllTwoMonthsDisplay[3] + "-" + daysInAllTwoMonths[3] || quickReplyPayload === "2017-" + arrivalAllTwoMonthsDisplay[4] + "-" + daysInAllTwoMonths[4] || quickReplyPayload === "2017-" + arrivalAllTwoMonthsDisplay[5] + "-" + daysInAllTwoMonths[5] || quickReplyPayload === "2017-" + arrivalAllTwoMonthsDisplay[6] + "-" + daysInAllTwoMonths[6] || quickReplyPayload === "2017-" + arrivalAllTwoMonthsDisplay[7] + "-" + daysInAllTwoMonths[7] || quickReplyPayload === "2017-" + arrivalAllTwoMonthsDisplay[8] + "-" + daysInAllTwoMonths[8] || quickReplyPayload === "2017-" + arrivalAllTwoMonthsDisplay[9] + "-" + daysInAllTwoMonths[9] || quickReplyPayload === "2017-" + arrivalAllTwoMonthsDisplay[10] + "-" + daysInAllTwoMonths[10]) {
            //Status update feedback is sent, so that the user knows that the offer is created
            sendStatusFeedbackRequest(senderID);
            //departureDate is assigned
            assignDepartureDateVar(quickReplyPayload);
            //Range of stay is calculated
            calculateStayRange(arrivalDate, departureDate);
            //Check if date is in the past - if so error message is send
            checkIfDateIsInPast(senderID);
            if (dateIsInThePast) {
                return;
            } else {
                //XML post request to cultuzz channel manager is executed
                sendXmlPostRequest(numberOfRooms, numberOfPersons, arrivalDate, departureDate, doppelzimmerClassicSteinleo, einzelzimmerSommerstein, doppelzimmerDeluxeHolzleo, doppelzimmerSuperiorSteinleo);
                //If hotel is closed, send error message, else create suited offer
                setTimeout(function () {
                    checkIfHotelIsClosed(senderID);
                    if (hotelIsClosed) {
                        console.log("Hotel is closed, really!");
                    } else {
                        setTimeout(calculatePrice, 30, stayRange, numberOfRooms);
                        setTimeout(createBookingLink, 40, arrivalDateSplitted, departureDateSplitted, numberOfPersons);
                        setTimeout(checkTypeOfOffer, 100, senderID);
                        exportSenderID(senderID);
                    }
                }, 15000);
            }
        }
    }

    if (messageText) {
        if (autoAnswerIsOn === false) {
            return
        }

        // If we receive a text message, check to see if it matches any special
        // keywords and send back the corresponding example. Otherwise, just echo
        // the text we received.

        switch (messageText) {

            case 'Menü':
                sendMenu(senderID);
                break;

            case 'typing on':
                sendTypingOn(senderID);
                break;

            case 'typing off':
                sendTypingOff(senderID);
                break;

            case 'account linking':
                sendAccountLinking(senderID);
                break;

            case 'Zimmer Anfrage':
                sendPersonRequest(senderID);
                break;

            case 'Persönliche Beratung':
                sendPersonalFeedback(senderID);
                break;

            case "pay":
                sendPaymentButton(senderID);
                break;

            default:
                /* Auto reply Menu disabled
                 *
                 *if (typeof quickReplyPayload === "undefined") {
                 *   sendMenu(senderID);
                 * }
                 */
            }
        }
}

/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about 
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      console.log("Received delivery confirmation for message ID: %s", 
        messageID);
    });
  }

  console.log("All message before %d were delivered.", watermark);
}

/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message. 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 * 
 */
function receivedPostback(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;
    // The 'payload' param is a developer-defined field which is set in a postback
    // button for Structured Messages.
    var payload = event.postback.payload;
    //console.log(messageData.message.attachment.payload.elements[0].title);
    console.log("Received postback for user %d and page %d with payload '%s' " +
        "at %d", senderID, recipientID, payload, timeOfPostback);

    // When a postback is called, we'll send a message back to the sender to
    // let them know it was successful
   if (payload === "1") {
       sendGifMessage(senderID);
   }
   else if (payload === "GET_STARTED_PAYLOAD") {
       sendWelcomeMessage(senderID);
   }    else if (payload === "Zimmer Anfrage") {
       sendPersonRequest(senderID);
   }    else if (payload === "personal") {
       sendPersonalFeedback(senderID);
   } else if (payload === "DEVELOPER_DEFINED_PAYLOAD") {

   }
}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 * 
 */
function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  // All messages before watermark (a timestamp) or sequence have been seen.
  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  console.log("Received message read event for watermark %d and sequence " +
    "number %d", watermark, sequenceNumber);
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 * 
 */

//If the hotel is closed the price per room per night is above 1000 EUR. As a rule all prices above 1000 EUR per night and per room trigger this Error Messages.
function sendErrorMessageNoRoom(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "Zu diesem Zeitpunkt gibt es leider keine Verfügbarkeiten.",
                    buttons:[ {
                        type: "postback",
                        title: "Erneute Anfrage",
                        payload: "Zimmer Anfrage"
                    }, {
                        type: "postback",
                        title: "Persönliche Beratung",
                        payload: "personal"
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}

function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  console.log("Received account link event with for user %d with status %s " +
    "and auth code %s ", senderID, status, authCode);
}
//Employee will soon take care of users request
function sendPersonalFeedback(recipientId) {

    autoAnswerIsOn = false;

    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "Es wird sich ehestmöglich einer unserer Mitarbeiter um Ihre Anfrage kümmern.",
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a text message using the Send API.
 *
 */
//sendMessage example -> used and called in receivedAuthentication function
function sendTextMessage(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText,
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
}
//Function called if user signes up first time
function sendWelcomeMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "Hallo & Willkommen beim Chatbot vom Hotel Salzburger Hof Leogang - #homeofsports. Wollen Sie eine Zimmer Anfrage erstellen, oder persönlich beraten werden? Schreiben Sie oder wählen Sie aus.",
                    buttons:[ {
                        type: "postback",
                        title: "Zimmer Anfrage",
                        payload: "Zimmer Anfrage"
                    }, {
                        type: "postback",
                        title: "Persönliche Beratung",
                        payload: "personal"
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}
//Function called in receivedMessage
function sendStatusFeedbackRequest(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "Das Angebot wird erstellt. Einen Moment bitte!",
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
}
//Function called in receivedMessage
function sendDepartureDateSuggestion(recipientId) {

    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            "text":"Wann wollen Sie abreisen?:",
            "quick_replies":[
                {
                    "content_type":"text",
                    "title": daysInAllTwoMonths[0] + "." + arrivalAllTwoMonthsDisplay[0] + "." + "2017",
                    "payload":"2017-" + arrivalAllTwoMonthsDisplay[0] + "-" + daysInAllTwoMonths[0]
                },
                {
                    "content_type":"text",
                    "title": daysInAllTwoMonths[1] + "." + arrivalAllTwoMonthsDisplay[1] + "." + "2017",
                    "payload":"2017-" + arrivalAllTwoMonthsDisplay[1] + "-" + daysInAllTwoMonths[1]
                },
                {
                    "content_type":"text",
                    "title": daysInAllTwoMonths[2] + "." + arrivalAllTwoMonthsDisplay[2] + "." + "2017",
                    "payload":"2017-" + arrivalAllTwoMonthsDisplay[2] + "-" + daysInAllTwoMonths[2]
                },
                {
                    "content_type":"text",
                    "title": daysInAllTwoMonths[3] + "." + arrivalAllTwoMonthsDisplay[3] + "." + "2017",
                    "payload":"2017-" + arrivalAllTwoMonthsDisplay[3] + "-" + daysInAllTwoMonths[3]
                },
                {
                    "content_type":"text",
                    "title": daysInAllTwoMonths[4] + "." + arrivalAllTwoMonthsDisplay[4] + "." + "2017",
                    "payload":"2017-" + arrivalAllTwoMonthsDisplay[4] + "-" + daysInAllTwoMonths[4]
                },
                {
                    "content_type":"text",
                    "title": daysInAllTwoMonths[5] + "." + arrivalAllTwoMonthsDisplay[5] + "." + "2017",
                    "payload":"2017-" + arrivalAllTwoMonthsDisplay[5] + "-" + daysInAllTwoMonths[5]
                },
                {
                    "content_type":"text",
                    "title": daysInAllTwoMonths[6] + "." + arrivalAllTwoMonthsDisplay[6] + "." + "2017",
                    "payload":"2017-" + arrivalAllTwoMonthsDisplay[6] + "-" + daysInAllTwoMonths[6]
                },
                {
                    "content_type":"text",
                    "title": daysInAllTwoMonths[7] + "." + arrivalAllTwoMonthsDisplay[7] + "." + "2017",
                    "payload":"2017-" + arrivalAllTwoMonthsDisplay[0] + "-" + daysInAllTwoMonths[7]
                },
                {
                    "content_type":"text",
                    "title": daysInAllTwoMonths[8] + "." + arrivalAllTwoMonthsDisplay[8] + "." + "2017",
                    "payload":"2017-" + arrivalAllTwoMonthsDisplay[7] + "-" + daysInAllTwoMonths[8]
                },
                {
                    "content_type":"text",
                    "title": daysInAllTwoMonths[9] + "." + arrivalAllTwoMonthsDisplay[9] + "." + "2017",
                    "payload":"2017-" + arrivalAllTwoMonthsDisplay[8] + "-" + daysInAllTwoMonths[9]
                },
                {
                    "content_type":"text",
                    "title": daysInAllTwoMonths[10] + "." + arrivalAllTwoMonthsDisplay[10] + "." + "2017",
                    "payload":"2017-" + arrivalAllTwoMonthsDisplay[9] + "-" + daysInAllTwoMonths[10]
                },
            ]
        }
    };

    callSendAPI(messageData);
}
//function called if case: 'Menü' in receivedMessage
function sendMenu(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Menü - Wollen Sie eine Zimmer Anfrage erstellen, oder persönlich beraten werden? Schreiben Sie oder wählen Sie aus.",
          buttons:[ {
            type: "postback",
            title: "Zimmer Anfrage",
            payload: "Zimmer Anfrage"
          }, {
            type: "postback",
            title: "Persönliche Beratung",
            payload: "personal"
          } ]
        }
      }
    }
  };  

  callSendAPI(messageData);
}
//function called if case: 'Zimmer Anfrage' in receivedMessage
function sendPersonRequest(recipientId) {

    autoAnswerIsOn = true;

    var messageData = {
        recipient: {
            id: recipientId
        },
                  message: {
                      "text":"Anzahl der Personen:",
                      "quick_replies":[
                          {
                              "content_type":"text",
                              "title":"1 Person",
                              "payload":"1 person"
                          },
                          {
                              "content_type":"text",
                              "title":"2 Personen",
                              "payload":"2 persons"
                          },
                          {
                              "content_type":"text",
                              "title":"3 Personen",
                              "payload":"3 persons"
                          },
                          {
                              "content_type":"text",
                              "title":"4 Personen",
                              "payload":"4 persons"
                          },
                          {
                              "content_type":"text",
                              "title":"5 Personen",
                              "payload":"5 persons"
                          }
                      ]
                  }
              };

    callSendAPI(messageData);
}
//Function called in receivedMessage
function sendRoomRequest(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            "text":"Anzahl der Zimmer:",
            "quick_replies":[
                {
                    "content_type":"text",
                    "title":"1 Zimmer",
                    "payload":"1 room"
                },
                {
                    "content_type":"text",
                    "title":"2 Zimmer",
                    "payload":"2 rooms"
                },
                {
                    "content_type":"text",
                    "title":"3 Zimmer",
                    "payload":"3 rooms"
                },
                {
                    "content_type":"text",
                    "title":"4 Zimmer",
                    "payload":"4 rooms"
                },
                {
                    "content_type":"text",
                    "title":"5 Zimmer",
                    "payload":"5 rooms"
                }
            ]
        }
    };
    
    callSendAPI(messageData);
}
//Function called in receivedMessage
function sendArrivalDateMonth(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            "text":"Für welchen Monat wollen Sie anfragen?:",
            "quick_replies":[
                {
                    "content_type":"text",
                    "title":"Jänner",
                    "payload":"01"
                },
                {
                    "content_type":"text",
                    "title":"Februar",
                    "payload":"02"
                },
                {
                    "content_type":"text",
                    "title":"März",
                    "payload":"03"
                },
                {
                    "content_type":"text",
                    "title":"April",
                    "payload":"04"
                },
                {
                    "content_type":"text",
                    "title":"Mai",
                    "payload":"05"
                },
                {
                    "content_type":"text",
                    "title":"Juni",
                    "payload":"06"
                },
                {
                    "content_type":"text",
                    "title":"Mehr",
                    "payload":"mehr1"
                },
            ]
        }
    };

    callSendAPI(messageData);
}
//Function called in receivedMessage
function sendArrivalDateMonth2(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            "text":"Für welchen Monat wollen Sie anfragen?:",
            "quick_replies":[
                {
                    "content_type":"text",
                    "title":"Juli",
                    "payload":"07"
                },
                {
                    "content_type":"text",
                    "title":"August",
                    "payload":"08"
                },
                {
                    "content_type":"text",
                    "title":"September",
                    "payload":"09"
                },
                {
                    "content_type":"text",
                    "title":"Oktober",
                    "payload":"10"
                },
                {
                    "content_type":"text",
                    "title":"November",
                    "payload":"11"
                },
                {
                    "content_type":"text",
                    "title":"Dezember",
                    "payload":"12"
                },

            ]
        }
    };

    callSendAPI(messageData);
}
//Function called in receivedMessage
function sendArrivalDay(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            "text":"An welchen Tag wollen Sie anreisen?:",
            "quick_replies":[
                {
                    "content_type":"text",
                    "title":"01",
                    "payload":"d 01"
                },
                {
                    "content_type":"text",
                    "title":"02",
                    "payload":"d 02"
                },
                {
                    "content_type":"text",
                    "title":"03",
                    "payload":"d 03"
                },
                {
                    "content_type":"text",
                    "title":"04",
                    "payload":"d 04"
                },
                {
                    "content_type":"text",
                    "title":"05",
                    "payload":"d 05"
                },
                {
                    "content_type":"text",
                    "title":"06",
                    "payload":"d 06"
                },
                {
                    "content_type":"text",
                    "title":"07",
                    "payload":"d 07"
                },
                {
                    "content_type":"text",
                    "title":"08",
                    "payload":"d 08"
                },
                {
                    "content_type":"text",
                    "title":"09",
                    "payload":"d 09"
                },
                {
                    "content_type":"text",
                    "title":"10",
                    "payload":"d 10"
                },
                {
                    "content_type":"text",
                    "title":"Mehr",
                    "payload":"mehr2"
                },

            ]
        }
    };

    callSendAPI(messageData);
}
//Function called in receivedMessage
function sendArrivalDay2(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            "text":"An welchen Tag wollen Sie anreisen?:",
            "quick_replies":[

                {
                    "content_type":"text",
                    "title":"11",
                    "payload":"d 11"
                },
                {
                    "content_type":"text",
                    "title":"12",
                    "payload":"d 12"
                },
                {
                    "content_type":"text",
                    "title":"13",
                    "payload":"d 13"
                },
                {
                    "content_type":"text",
                    "title":"14",
                    "payload":"d 14"
                },
                {
                    "content_type":"text",
                    "title":"15",
                    "payload":"d 15"
                },
                {
                    "content_type":"text",
                    "title":"16",
                    "payload":"d 16"
                },
                {
                    "content_type":"text",
                    "title":"17",
                    "payload":"d 17"
                },
                {
                    "content_type":"text",
                    "title":"18",
                    "payload":"d 18"
                },
                {
                    "content_type":"text",
                    "title":"19",
                    "payload":"d 19"
                },
                {
                    "content_type":"text",
                    "title":"20",
                    "payload":"d 20"
                },
                {
                    "content_type":"text",
                    "title":"Mehr",
                    "payload":"mehr3"
                },
            ]
        }
    };

    callSendAPI(messageData);
}
//Function called in receivedMessage
function sendArrivalDay3(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            "text":"An welchen Tag wollen Sie anreisen?:",
            "quick_replies":[
                {
                    "content_type":"text",
                    "title":"21",
                    "payload":"d 21"
                },
                {
                    "content_type":"text",
                    "title":"22",
                    "payload":"d 22"
                },
                {
                    "content_type":"text",
                    "title":"23",
                    "payload":"d 23"
                },
                {
                    "content_type":"text",
                    "title":"24",
                    "payload":"d 24"
                },
                {
                    "content_type":"text",
                    "title":"25",
                    "payload":"d 25"
                },
                {
                    "content_type":"text",
                    "title":"26",
                    "payload":"d 26"
                },
                {
                    "content_type":"text",
                    "title":"27",
                    "payload":"d 27"
                },
                {
                    "content_type":"text",
                    "title":"28",
                    "payload":"d 28"
                },
                {
                    "content_type":"text",
                    "title":"29",
                    "payload":"d 29"
                },
                {
                    "content_type":"text",
                    "title":"30",
                    "payload":"d 30"
                },
                {
                    "content_type":"text",
                    "title":"31",
                    "payload":"d 31"
                },
            ]
        }
    };

    callSendAPI(messageData);
}
//Called in receivedMessage if all data is recieved -> calls the right sendGenericMessageOffer1 function
function checkTypeOfOffer(senderID) {
    switch (numberOfRooms + "|" + numberOfPersons) {
        case "1|1":
            sendGenericMessageOffer1(senderID);
            break;
        case "1|2":
            sendGenericMessageOffer2(senderID);
            break;
        case "1|3":
            sendGenericMessageOffer3(senderID);
            break;
        case "1|4":
            sendGenericMessageOffer5(senderID);
            break;
        case "1|5":
            sendGenericMessageOffer7(senderID);
            break;
        case "2|1":
            sendGenericMessageOffer6(senderID);
            break;
        case "2|2":
            sendGenericMessageOffer6(senderID);
            break;
        case "2|3":
            sendGenericMessageOffer4(senderID);
            break;
        case "2|4":
            sendGenericMessageOffer5(senderID);
            break;
        case "2|5":
            sendGenericMessageOffer7(senderID);
            break;
        case "3|1":
            sendGenericMessageOffer8(senderID);
            break;
        case "3|2":
            sendGenericMessageOffer8(senderID);
            break;
        case "3|3":
            sendGenericMessageOffer8(senderID);
            break;
        case "3|4":
            sendGenericMessageOffer11(senderID);
            break;
        case "3|5":
            sendGenericMessageOffer7(senderID);
            break;
        case "4|1":
            sendGenericMessageOffer9(senderID);
            break;
        case "4|2":
            sendGenericMessageOffer9(senderID);
            break;
        case "4|3":
            sendGenericMessageOffer9(senderID);
            break;
        case "4|4":
            sendGenericMessageOffer9(senderID);
            break;
        case "4|5":
            sendGenericMessageOffer12(senderID);
            break;
        case "5|1":
            sendGenericMessageOffer10(senderID);
            break;
        case "5|2":
            sendGenericMessageOffer10(senderID);
            break;
        case "5|3":
            sendGenericMessageOffer10(senderID);
            break;
        case "5|4":
            sendGenericMessageOffer10(senderID);
            break;
        case "5|5":
            sendGenericMessageOffer10(senderID);
            break;
    }
}
//Send Payment button
function sendPaymentButton(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",

                    elements: [
                        {
                            title: String(numberOfRooms) + " Einzelzimmer Sommerstein | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + ".2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                            subtitle: String(priceAllNightsEinzelzimmerSommerstein) + ",00 EUR | Preis ist kalkuliert für " + (numberOfPersons) + " Erwachsenen ",
                            item_url: bookingLink,
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Einzelzimmer-Sommerstein1-1.9.png",
                            "buttons":[
                                {
                                    "type":"payment",
                                    "title":"buy",
                                    "payload":"DEVELOPER_DEFINED_PAYLOAD",
                                    "payment_summary":{
                                        "currency":"USD",
                                        "payment_type":"FIXED_AMOUNT",
                                        "is_test_payment" : true,
                                        "merchant_name":"Peter's Apparel",
                                        "requested_user_info":[
                                            "shipping_address",
                                            "contact_name",
                                            "contact_phone",
                                            "contact_email"
                                        ],
                                        "price_list":[
                                            {
                                                "label":"Subtotal",
                                                "amount":"29.99"
                                            },
                                            {
                                                "label":"Taxes",
                                                "amount":"2.47"
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        }
    };

    callSendAPI(messageData);
}
/* Message Offer
 * "1|1" ----> double checked | WORKS
 * item_url - Link image links to
 * SERVER_URL - global variable, same as in config.json
 */
function sendGenericMessageOffer1(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",

                    elements: [
                        {
                            title: String(numberOfRooms) + " Einzelzimmer Sommerstein | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + ".2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                            subtitle: String(priceAllNightsEinzelzimmerSommerstein) + ",00 EUR | Preis ist kalkuliert für " + (numberOfPersons) + " Erwachsenen ",
                            item_url: SERVER_URL + "/checkout",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Einzelzimmer-Sommerstein1-1.9.png",
                            buttons: [{
                                type: "web_url",
                                url: SERVER_URL + "/checkout",
                                title: "Buchen & Details"
                            }, {
                                type: "postback",
                                title: "Persönliche Beratung",
                                payload: "personal"
                            }]
                        }
                    ]
                }
            }
        }
    };

    callSendAPI(messageData);

    app.locals.titleSummary = messageData.message.attachment.payload.elements[0].title;
    app.locals.subTitleSummary = messageData.message.attachment.payload.elements[0].subtitle;
    exports.totalPrice = priceAllNightsEinzelzimmerSommerstein;
    exports.ratePlanID = "<RoomRate NumberOfUnits=\"1\" RatePlanID=\"420596\" RatePlanType=\"11\" />";
}
//"1|2" ----> double checked | DoppelzimmerHolzleo WORKS | DoppelzimmerSuperiorSteinleo WORKS | Classic Steinleo WORKS
function sendGenericMessageOffer2(recipientId) {
   var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",

                    elements: [{
                        title: String(numberOfRooms) + " Doppelzimmer Deluxe Holzleo | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                        subtitle: String(priceAllNightsDoppelzimmerDeluxeHolzleo) + ",00 EUR  | Preis ist kalkuliert für " + (numberOfPersons) + " Erwachsene ",
                        item_url: SERVER_URL + "/DoppelzimmerDeluxeHolzleo",
                        image_url: "https://gettagbag.com/wp-content/uploads/2017/04/zimmer_holzleo_uebersicht.jpg",
                        buttons: [{
                            type: "web_url",
                            url: SERVER_URL + "/DoppelzimmerDeluxeHolzleo",
                            title: "Buchen & Details"
                        }, {
                            type: "postback",
                            title: "Persönliche Beratung",
                            payload: "personal"
                        }]
                    },
                        {
                            title: String(numberOfRooms) + " Doppelzimmer Superior Steinleo | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                            subtitle: String(priceAllNightsDoppelzimmerSuperiorSteinleo) + ",00 EUR  | Preis ist kalkuliert für " + (numberOfPersons) + " Erwachsene ",
                            item_url: SERVER_URL + "/DoppelzimmerSuperiorSteinleo",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-Superior-Steinleo.png",
                            buttons: [{
                                type: "web_url",
                                url: SERVER_URL + "/DoppelzimmerSuperiorSteinleo",
                                title: "Buchen & Details"
                            }, {
                                type: "postback",
                                title: "Persönliche Beratung",
                                payload: "personal"
                            }]
                        },
                        {
                            title: String(numberOfRooms) + " Doppelzimmer Classic Steinleo | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                            subtitle: String(priceAllNightsDoppelzimmerClassicSteinleo + ",00 EUR  | Preis ist kalkuliert für " + (numberOfPersons) + " Erwachsene "),
                            item_url: SERVER_URL + "/DoppelzimmerClassicSteinleo",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-classic-Steinleo.png",
                            buttons: [{
                                type: "web_url",
                                url: SERVER_URL + "/DoppelzimmerClassicSteinleo",
                                title: "Buchen & Details"
                            }, {
                                type: "postback",
                                title: "Persönliche Beratung",
                                payload: "personal"
                            }]
                        }
                    ]
                }
            }
        }
    };

    callSendAPI(messageData);

    app.locals.titleSummary = messageData.message.attachment.payload.elements[0].title;
    app.locals.subTitleSummary = messageData.message.attachment.payload.elements[0].subtitle;

    app.locals.titleSummaryDoppelzimmerSuperiorSteinleo = messageData.message.attachment.payload.elements[1].title;
    app.locals.subTitleSummaryDoppelzimmerSuperiorSteinleo = messageData.message.attachment.payload.elements[1].subtitle;

    app.locals.titleSummaryDoppelzimmerClassicSteinleo = messageData.message.attachment.payload.elements[2].title;
    app.locals.subTitleSummaryDoppelzimmerClassicSteinleo = messageData.message.attachment.payload.elements[2].subtitle;



}
//"1|3" ----> double checked | WORKS
function sendGenericMessageOffer3(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",

                    elements: [{
                        title: String(numberOfRooms) + " Doppelzimmer Classic Steinleo | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                        subtitle: String(priceAllNightsDoppelzimmerClassicSteinleo + ",00 EUR  | Preis ist kalkuliert für " + (numberOfPersons) + " Erwachsene "),
                        item_url: SERVER_URL + "/checkout",
                        image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-classic-Steinleo.png",
                        buttons: [{
                            type: "web_url",
                            url: SERVER_URL + "/checkout",
                            title: "Buchen & Details"
                        }, {
                            type: "postback",
                            title: "Persönliche Beratung",
                            payload: "personal"
                        }]
                    },
                        {
                            title: String(numberOfRooms) + " Einzelzimmer Sommerstein | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                            subtitle: String(priceAllNightsEinzelzimmerSommerstein) + ",00 EUR + " + String(priceAllNightsDoppelzimmerClassicSteinleo) + ",00 EUR  = " + String(priceAllNightsDoppelzimmerClassicSteinleo + priceAllNightsEinzelzimmerSommerstein + ",00 EUR | Preis ist kalkuliert für " + (numberOfPersons) + " Erwachsene "),
                            item_url: SERVER_URL + "/checkout",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Einzelzimmer-Sommerstein1-1.9.png",
                            buttons: [{
                                type: "web_url",
                                url: SERVER_URL + "/checkout",
                                title: "Buchen & Details"
                            }, {
                                type: "postback",
                                title: "Persönliche Beratung",
                                payload: "personal"
                            }]
                        }

                    ]
                }
            }
        }
    };

    callSendAPI(messageData);

    app.locals.titleSummary = messageData.message.attachment.payload.elements[0].title;
    app.locals.subTitleSummary = messageData.message.attachment.payload.elements[0].subtitle;
    app.locals.titleSummary2 = messageData.message.attachment.payload.elements[1].title;
    app.locals.subTitleSummary2 = messageData.message.attachment.payload.elements[1].subtitle;

    exports.totalPrice = priceAllNightsDoppelzimmerClassicSteinleo + priceAllNightsEinzelzimmerSommerstein;
    exports.ratePlanID = "<RoomRate NumberOfUnits=\"1\" RatePlanID=\"420596\" RatePlanType=\"11\" /><RoomRate NumberOfUnits=\"1\" RatePlanID=\"420594\" RatePlanType=\"11\" />";

}
//"2|3" ----> double checked | WORKS
function sendGenericMessageOffer4(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",

                    elements: [{
                        title: String(numberOfRooms / numberOfRooms) + " Doppelzimmer Classic Steinleo | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                        subtitle: String((priceAllNightsDoppelzimmerClassicSteinleo / numberOfRooms ) + ",00 EUR "),
                        item_url: SERVER_URL + "/checkout",
                        image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-classic-Steinleo.png",
                        buttons: [{
                            type: "web_url",
                            url: SERVER_URL + "/checkout",
                            title: "Open Web URL"
                        }, {
                            type: "postback",
                            title: "Details",
                            payload: "3"
                        }]
                    },
                        {
                            title: String(numberOfRooms / numberOfRooms) + " Einzelzimmer Sommerstein | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                            subtitle: String(priceAllNightsEinzelzimmerSommerstein / numberOfRooms) + ",00 EUR + " + String(priceAllNightsDoppelzimmerClassicSteinleo / numberOfRooms) + ",00 EUR  = " + String((priceAllNightsDoppelzimmerClassicSteinleo / numberOfRooms) + (priceAllNightsEinzelzimmerSommerstein / numberOfRooms) + ",00 EUR | Preis ist kalkuliert für " + (numberOfPersons) + " Erwachsene "),
                            item_url: SERVER_URL + "/checkout",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Einzelzimmer-Sommerstein1-1.9.png",
                            buttons: [{
                                type: "web_url",
                                url: SERVER_URL + "/checkout",
                                title: "Buchen & Details"
                            }, {
                                type: "postback",
                                title: "Persönliche Beratung",
                                payload: "personal"
                            }]
                        }

                    ]
                }
            }
        }
    };

    callSendAPI(messageData);

    app.locals.titleSummary = messageData.message.attachment.payload.elements[0].title;
    app.locals.subTitleSummary = messageData.message.attachment.payload.elements[0].subtitle;
    app.locals.titleSummary2 = messageData.message.attachment.payload.elements[1].title;
    app.locals.subTitleSummary2 = messageData.message.attachment.payload.elements[1].subtitle;

    exports.totalPrice = (priceAllNightsDoppelzimmerClassicSteinleo / numberOfRooms) + (priceAllNightsEinzelzimmerSommerstein / numberOfRooms);
    exports.ratePlanID = "<RoomRate NumberOfUnits=\"1\" RatePlanID=\"420594\" RatePlanType=\"11\" /><RoomRate NumberOfUnits=\"1\" RatePlanID=\"420596\" RatePlanType=\"11\" />";
}
//"1|4" / "2|4" ----> double checked | WORKS
function sendGenericMessageOffer5(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",

                    elements: [{
                        title: String(numberOfRooms) + " Doppelzimmer Deluxe Holzleo | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                        subtitle: String(priceAllNightsDoppelzimmerDeluxeHolzleo + ",00 EUR  | Preis ist kalkuliert für " + (numberOfPersons) + " Erwachsene "),
                        item_url: SERVER_URL + "/DoppelzimmerDeluxeHolzleo",
                        image_url: "https://gettagbag.com/wp-content/uploads/2017/04/zimmer_holzleo_uebersicht.jpg",
                        buttons: [{
                            type: "web_url",
                            url: SERVER_URL + "/DoppelzimmerDeluxeHolzleo",
                            title: "Buchen & Details"
                        }, {
                            type: "postback",
                            title: "Persönliche Beratung",
                            payload: "personal"
                        }]
                    },
                        {
                            title: String(numberOfRooms) + " Doppelzimmer Superior Steinleo | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                            subtitle: String(priceAllNightsDoppelzimmerSuperiorSteinleo + ",00 EUR  | Preis ist kalkuliert für " + (numberOfPersons) + " Erwachsene "),
                            item_url: SERVER_URL + "/DoppelzimmerSuperiorSteinleo",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-Superior-Steinleo.png",
                            buttons: [{
                                type: "web_url",
                                url: SERVER_URL + "/DoppelzimmerSuperiorSteinleo",
                                title: "Buchen & Details"
                            }, {
                                type: "postback",
                                title: "Persönliche Beratung",
                                payload: "personal"
                            }]
                        },
                        {
                            title: String(numberOfRooms) + " Doppelzimmer Classic Steinleo | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                            subtitle: String(priceAllNightsDoppelzimmerClassicSteinleo + ",00 EUR  | Preis ist kalkuliert für " + (numberOfPersons) + " Erwachsene "),
                            item_url: SERVER_URL + "/DoppelzimmerClassicSteinleo",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-classic-Steinleo.png",
                            buttons: [{
                                type: "web_url",
                                url: SERVER_URL + "/DoppelzimmerClassicSteinleo",
                                title: "Buchen & Details"
                            }, {
                                type: "postback",
                                title: "Persönliche Beratung",
                                payload: "personal"
                            }]
                        }
                    ]
                }
            }
        }
    };

    callSendAPI(messageData);

    app.locals.titleSummary = messageData.message.attachment.payload.elements[0].title;
    app.locals.subTitleSummary = messageData.message.attachment.payload.elements[0].subtitle;

    app.locals.titleSummaryDoppelzimmerSuperiorSteinleo = messageData.message.attachment.payload.elements[1].title;
    app.locals.subTitleSummaryDoppelzimmerSuperiorSteinleo = messageData.message.attachment.payload.elements[1].subtitle;

    app.locals.titleSummaryDoppelzimmerClassicSteinleo = messageData.message.attachment.payload.elements[2].title;
    app.locals.subTitleSummaryDoppelzimmerClassicSteinleo = messageData.message.attachment.payload.elements[2].subtitle;



}
//"2|1" / "2|2" ----> double checked | WORKS
function sendGenericMessageOffer6(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",

                    elements: [
                        {
                            title: String(numberOfRooms) + " Einzelzimmer Sommerstein | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                            subtitle: String(priceAllNightsEinzelzimmerSommerstein / numberOfRooms) + ",00 EUR + " + String(priceAllNightsEinzelzimmerSommerstein / numberOfRooms) + ",00 EUR = " + String(priceAllNightsEinzelzimmerSommerstein +  ",00 EUR | Preis ist kalkuliert für " + (numberOfPersons) + " Erwachsene "),
                            item_url: SERVER_URL + "/checkout",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Einzelzimmer-Sommerstein1-1.9.png",
                            buttons: [{
                                type: "web_url",
                                url: SERVER_URL + "/checkout",
                                title: "Buchen & Details"
                            }, {
                                type: "postback",
                                title: "Persönliche Beratung",
                                payload: "personal"
                            }]
                        },
                    ]
                }
            }
        }
    };

    callSendAPI(messageData);

    app.locals.titleSummary = messageData.message.attachment.payload.elements[0].title;
    app.locals.subTitleSummary = messageData.message.attachment.payload.elements[0].subtitle;

    exports.totalPrice = priceAllNightsEinzelzimmerSommerstein;
    exports.ratePlanID = "<RoomRate NumberOfUnits=\"2\" RatePlanID=\"420596\" RatePlanType=\"11\" />";

}
//"2|5" / "3|5" ----> double checked | WORKS
function sendGenericMessageOffer7(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",

                    elements: [{
                        title: String(numberOfRooms / numberOfRooms * 2) + " Doppelzimmer Classic Steinleo | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                        subtitle: String((priceAllNightsDoppelzimmerClassicSteinleo / numberOfRooms) * 2) + ",00 EUR | Preis ist kalkuliert für " + (numberOfPersons -1)+ " Erwachsene ",
                        item_url: SERVER_URL + "/checkout",
                        image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-classic-Steinleo.png",
                        buttons: [{
                            type: "web_url",
                            url: SERVER_URL + "/checkout",
                            title: "Buchen & Details"
                        }, {
                            type: "postback",
                            title: "Persönliche Beratung",
                            payload: "personal"
                        }]
                    },
                        {
                            title: String(numberOfRooms / numberOfRooms ) + " Einzelzimmer Sommerstein | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                            subtitle: String((priceAllNightsDoppelzimmerClassicSteinleo / numberOfRooms) * 2) + ",00 EUR + " + String(priceAllNightsEinzelzimmerSommerstein / numberOfRooms) + ",00 EUR = " + String(((priceAllNightsDoppelzimmerClassicSteinleo / numberOfRooms) * 2) + (priceAllNightsEinzelzimmerSommerstein / numberOfRooms)) + ",00 EUR | Preis ist kalkuliert für " + numberOfPersons + " Erwachsene",
                            item_url: SERVER_URL + "/checkout",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Einzelzimmer-Sommerstein1-1.9.png",
                            buttons: [{
                                type: "web_url",
                                url: SERVER_URL + "/checkout",
                                title: "Buchen & Details"
                            }, {
                                type: "postback",
                                title: "Persönliche Beratung",
                                payload: "personal"
                            }]
                        },
                    ]
                }
            }
        }
    };

    callSendAPI(messageData);

    app.locals.titleSummary = messageData.message.attachment.payload.elements[0].title;
    app.locals.subTitleSummary = messageData.message.attachment.payload.elements[0].subtitle;
    app.locals.titleSummary2 = messageData.message.attachment.payload.elements[1].title;
    app.locals.subTitleSummary2 = messageData.message.attachment.payload.elements[1].subtitle;

    exports.totalPrice = ((priceAllNightsDoppelzimmerClassicSteinleo / numberOfRooms) * 2) + (priceAllNightsEinzelzimmerSommerstein / numberOfRooms);
    exports.ratePlanID = "<RoomRate NumberOfUnits=\"1\" RatePlanID=\"420596\" RatePlanType=\"11\" /><RoomRate NumberOfUnits=\"2\" RatePlanID=\"420594\" RatePlanType=\"11\" />";
}
//"3|3" / "3|2" / "3|1"----> double checked | WORKS
function sendGenericMessageOffer8(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",

                    elements: [
                        {
                            title: String(numberOfRooms) + " Einzelzimmer Sommerstein | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                            subtitle: String(priceAllNightsEinzelzimmerSommerstein / 3) + ",00 EUR + " + String(priceAllNightsEinzelzimmerSommerstein / 3) + ",00 EUR + " + String(priceAllNightsEinzelzimmerSommerstein / 3) + ",00 EUR = " + String(priceAllNightsEinzelzimmerSommerstein) +  ",00 EUR | Preis ist kalkuliert für " + numberOfPersons + " Erwachsene",
                            item_url: SERVER_URL + "/checkout",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Einzelzimmer-Sommerstein1-1.9.png",
                            buttons: [{
                                type: "web_url",
                                url: SERVER_URL + "/checkout",
                                title: "Buchen & Details"
                            }, {
                                type: "postback",
                                title: "Persönliche Beratung",
                                payload: "personal"
                            }]
                        }
                    ]
                }
            }
        }
    };

    callSendAPI(messageData);

    app.locals.titleSummary = messageData.message.attachment.payload.elements[0].title;
    app.locals.subTitleSummary = messageData.message.attachment.payload.elements[0].subtitle;

    exports.totalPrice = (priceAllNightsEinzelzimmerSommerstein);
    exports.ratePlanID = "<RoomRate NumberOfUnits=\"3\" RatePlanID=\"420596\" RatePlanType=\"11\" />";

}
//"4|1" / "4|2" / "4|3" / "4|4" ----> double checked | WORKS
function sendGenericMessageOffer9(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",

                    elements: [
                        {
                            title: String(numberOfRooms) + " Einzelzimmer Sommerstein | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                            subtitle:  String(priceAllNightsEinzelzimmerSommerstein) +  ",00 EUR | Preis ist kalkuliert für " + numberOfPersons + " Erwachsene",
                            item_url: SERVER_URL + "/checkout",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Einzelzimmer-Sommerstein1-1.9.png",
                            buttons: [{
                                type: "web_url",
                                url: SERVER_URL + "/checkout",
                                title: "Buchen & Details"
                            }, {
                                type: "postback",
                                title: "Persönliche Beratung",
                                payload: "personal"
                            }]
                        }
                    ]
                }
            }
        }
    };

    callSendAPI(messageData);

    app.locals.titleSummary = messageData.message.attachment.payload.elements[0].title;
    app.locals.subTitleSummary = messageData.message.attachment.payload.elements[0].subtitle;

    exports.totalPrice = priceAllNightsEinzelzimmerSommerstein;
    exports.ratePlanID = "<RoomRate NumberOfUnits=\"4\" RatePlanID=\"420596\" RatePlanType=\"11\" />";
}
//"5|1" / "5|2" / "5|3" / "5|4" / "5|5" ----> double checked | WORKS
function sendGenericMessageOffer10(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",

                    elements: [
                        {
                            title: String(numberOfRooms) + " Einzelzimmer Sommerstein | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                            subtitle:  String(priceAllNightsEinzelzimmerSommerstein) +  ",00 EUR | Preis ist kalkuliert für " + numberOfPersons + " Erwachsene",
                            item_url: SERVER_URL + "/checkout",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Einzelzimmer-Sommerstein1-1.9.png",
                            buttons: [{
                                type: "web_url",
                                url: SERVER_URL + "/checkout",
                                title: "Buchen & Details"
                            }, {
                                type: "postback",
                                title: "Persönliche Beratung",
                                payload: "personal"
                            }]
                        }
                    ]
                }
            }
        }
    };

    callSendAPI(messageData);

    app.locals.titleSummary = messageData.message.attachment.payload.elements[0].title;
    app.locals.subTitleSummary = messageData.message.attachment.payload.elements[0].subtitle;

    exports.totalPrice = priceAllNightsEinzelzimmerSommerstein;
    exports.ratePlanID = "<RoomRate NumberOfUnits=\"5\" RatePlanID=\"420596\" RatePlanType=\"11\" />";

}
//"3|4" ----> double checked | WORKS
function sendGenericMessageOffer11(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",

                    elements: [{
                        title: String(numberOfRooms / numberOfRooms) + " Doppelzimmer Classic Steinleo | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                        subtitle: String(priceAllNightsDoppelzimmerClassicSteinleo / numberOfRooms) + ",00 EUR",
                        item_url: SERVER_URL + "/checkout",
                        image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-classic-Steinleo.png",
                        buttons: [{
                            type: "web_url",
                            url: SERVER_URL + "/checkout",
                            title: "Buchen & Details"
                        }, {
                            type: "postback",
                            title: "Persönliche Beratung",
                            payload: "personal"
                        }]
                    },
                        {
                            title: String((numberOfRooms / numberOfRooms) * 2) + " Einzelzimmer Sommerstein | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                            subtitle: priceAllNightsDoppelzimmerClassicSteinleo / numberOfRooms + ",00 EUR + " + ((priceAllNightsEinzelzimmerSommerstein / numberOfRooms) * 2)+ ",00 EUR  = " + ((priceAllNightsDoppelzimmerClassicSteinleo / numberOfRooms) + ((priceAllNightsEinzelzimmerSommerstein / numberOfRooms) * 2)) + ",00 EUR | Preis ist kalkuliert für " + numberOfPersons + " Erwachsene",
                            item_url: "https://hotelmessengertagbag.herokuapp.com/checkout",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Einzelzimmer-Sommerstein1-1.9.png",
                            buttons: [{
                                type: "web_url",
                                url: "https://hotelmessengertagbag.herokuapp.com/checkout",
                                title: "Buchen & Details"
                            }, {
                                type: "postback",
                                title: "Persönliche Beratung",
                                payload: "personal"
                            }]
                        }
                    ]
                }
            }
        }
    };

    callSendAPI(messageData);

    app.locals.titleSummary = messageData.message.attachment.payload.elements[0].title;
    app.locals.subTitleSummary = messageData.message.attachment.payload.elements[0].subtitle;
    app.locals.titleSummary2 = messageData.message.attachment.payload.elements[1].title;
    app.locals.subTitleSummary2 = messageData.message.attachment.payload.elements[1].subtitle;

    exports.totalPrice = ((priceAllNightsDoppelzimmerClassicSteinleo / numberOfRooms) + ((priceAllNightsEinzelzimmerSommerstein / numberOfRooms) * 2));
    exports.ratePlanID = "<RoomRate NumberOfUnits=\"2\" RatePlanID=\"420596\" RatePlanType=\"11\" /><RoomRate NumberOfUnits=\"1\" RatePlanID=\"420594\" RatePlanType=\"11\" />";

}
//"4|5" ----> double checked | WORKS
function sendGenericMessageOffer12(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",

                    elements: [{
                        title: String(numberOfRooms / numberOfRooms) + " Doppelzimmer Classic Steinleo | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                        subtitle: String(priceAllNightsDoppelzimmerClassicSteinleo / numberOfRooms) + ",00 EUR ",
                        item_url: SERVER_URL + "/checkout",
                        image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-classic-Steinleo.png",
                        buttons: [{
                            type: "web_url",
                            url: SERVER_URL + "/checkout",
                            title: "Buchen & Details"
                        }, {
                            type: "postback",
                            title: "Persönliche Beratung",
                            payload: "personal"
                        }]
                    },
                        {
                            title: String((numberOfRooms/ numberOfRooms) * 3) + " Einzelzimmer Sommerstein | Von " + arrivalDateDayCalculations + "." + arrivalDateMonthCalculations + "." + "2017 bis " + departureDateSplitted[2] + "." + departureDateSplitted[1] + ".2017 | " + stayRange + " Übernachtung/en",
                            subtitle: (priceAllNightsEinzelzimmerSommerstein / numberOfRooms) * 3 + ",00 EUR + " + priceAllNightsDoppelzimmerClassicSteinleo / numberOfRooms + ",00 EUR  = " + (priceAllNightsDoppelzimmerClassicSteinleo / numberOfRooms + ((priceAllNightsEinzelzimmerSommerstein / numberOfRooms) * 3)) + ",00 EUR | Preis ist kalkuliert für " + numberOfPersons + " Erwachsene" ,
                            item_url: SERVER_URL + "/checkout",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Einzelzimmer-Sommerstein1-1.9.png",
                            buttons: [{
                                type: "web_url",
                                url: SERVER_URL + "/checkout",
                                title: "Buchen & Details"
                            }, {
                                type: "postback",
                                title: "Persönliche Beratung",
                                payload: "personal"
                            }]
                        }

                    ]
                }
            }
        }
    };

    callSendAPI(messageData);

    app.locals.titleSummary = messageData.message.attachment.payload.elements[0].title;
    app.locals.subTitleSummary = messageData.message.attachment.payload.elements[0].subtitle;
    app.locals.titleSummary2 = messageData.message.attachment.payload.elements[1].title;
    app.locals.subTitleSummary2 = messageData.message.attachment.payload.elements[1].subtitle;

    exports.totalPrice = (priceAllNightsDoppelzimmerClassicSteinleo / numberOfRooms + ((priceAllNightsEinzelzimmerSommerstein / numberOfRooms) * 3));
    exports.ratePlanID = "<RoomRate NumberOfUnits=\"3\" RatePlanID=\"420596\" RatePlanType=\"11\" /><RoomRate NumberOfUnits=\"1\" RatePlanID=\"420594\" RatePlanType=\"11\" />";

}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {
  console.log("Turning typing indicator on");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  callSendAPI(messageData);
}


/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId) {
  console.log("Turning typing indicator off");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}

/*
 * Send a message with the account linking call-to-action
 *
 */
function sendAccountLinking(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Welcome. Link your account.",
          buttons:[{
            type: "account_link",
            url: SERVER_URL + "/authorize"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 * If Failed calling Send API a put request is made to the the REST-FUL API in index.js
 */
function callSendAPI(messageData) {
    console.log("callSendAPI function in app.js called - line 2476");
    console.log("recipient ID: - line 2477 " + messageData.recipient.id);
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

        if (messageId) {
            console.log("Successfully sent message with id %s to recipient %s",
            messageId, recipientId);
        } else {
            console.log("Successfully called Send API for recipient %s",
            recipientId);
        }
        } else {
            //Fehlercodes hier zu finden: https://developers.facebook.com/docs/messenger-platform/send-api-reference/errors
            console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
            //If error is because attached file can not be found, DB is not getting updated
            var errorMsgNoDBUpdate = "Failed to fetch the file from the url";
            //If error is because message is empty, DB is not getting updated
            var errorMsgNoDBUpdate2 = "Message cannot be empty, must provide valid attachment or text";
        if (body.error.message.indexOf(errorMsgNoDBUpdate) !== -1  || body.error.message.indexOf(errorMsgNoDBUpdate2) !== -1) {
          return;
        }
            console.log(messageData.recipient.id);
            // var c is assigned to the current recipient id
            c = messageData.recipient.id;
            //updateDB  is called with current recipient id value -> c which is a global variable
        updateDB();
        }
    });
}

//Exports callSendAPI to index.js file
exports.callSendAPI = callSendAPI;

/*
 * Send update to REST-ful API in index.js if signed-out, change signed-up field to false
 */
function updateDB(){
    console.log("updateDB function called to REST API /guests - line 2521 with recipientId: " + c);

     // An object of options to indicate where to post to
     var put_options = {
        //Change URL on top if deploying
        host: HOST_URL,
        port: '80',
        path: '/guests',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
     };

     // Set up the request
     var put_req = http.request(put_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: of successful put request + chunk var (deleted): //app.js 2540');
        });
     });

     // post the data
     put_req.write(c);
     put_req.end();
}

/*
 * Start server
 * Webhooks must be available via SSL with a certificate signed by a valid
 * certificate authority.
 */
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;