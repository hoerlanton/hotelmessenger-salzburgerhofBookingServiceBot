/*
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

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
  parseString = require('xml2js').parseString;

//var localStorage = require('node-localstorage');


var app = express();
app.set('port', process.env.PORT || 8000);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));

var resultTransferData = [];

var numberOfPersons = 0;
var numberOfRooms = 0;
var count = 0;
var arrivalDateMonth = 0;
var arrivalDateDay = 0;
var arrivalDateDayCalculations = 0;
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
var cancelled = false;

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

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
  console.error("Missing config values");
  process.exit(1);
}

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

//localStorage Setup
/*
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

localStorage.setItem('myFirstKey', 'myFirstValue');
console.log(localStorage.getItem('myFirstKey'));
*/

var doppelzimmerClassicSteinleo_StandardRateHP = "<RatePlanCandidate RatePlanType=\"11\" RatePlanID=\"432202\"/>";
var einzelzimmerSommerstein_StandardRateHP = "<RatePlanCandidate RatePlanType=\"11\" RatePlanID=\"432208\"/>";
var doppelzimmerDeluxeHolzleo_ShortHP = "<RatePlanCandidate RatePlanType=\"11\" RatePlanID=\"532674\"/>";
var doppelzimmerSuperiorSteinleo_StandardRateHP = "<RatePlanCandidate RatePlanType=\"11\" RatePlanID=\"432214\"/>";

function sendXmlPostRequest(numberOfRooms, numberOfPersons, arrivalDate, departureDate, doppelzimmerClassicSteinleo_StandardRateHP, einzelzimmerSommerstein_StandardRateHP, doppelzimmerDeluxeHolzleo_ShortHP, doppelzimmerSuperiorSteinleo_StandardRateHP) {

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
        var body = 'otaRQ=<?xml version="1.0" encoding="UTF-8"?><OTA_HotelAvailRQ xmlns="http://www.opentravel.org/OTA/2003/05" Version="3.30" TimeStamp="2011-07-12T05:59:49" PrimaryLangID="de"><POS><Source AgentSine="49082" AgentDutyCode="513f3eb9b082756f"><RequestorID Type="10" ID="50114" ID_Context="CLTZ"/><BookingChannel Type="7"/></Source></POS><AvailRequestSegments><AvailRequestSegment ResponseType="RateInfoDetails" InfoSource="MyPersonalStay"><StayDateRange Start="' + arrivalDate + '" End="' + departureDate + '"/><RatePlanCandidates>' + doppelzimmerClassicSteinleo_StandardRateHP + einzelzimmerSommerstein_StandardRateHP + doppelzimmerDeluxeHolzleo_ShortHP + doppelzimmerSuperiorSteinleo_StandardRateHP + '</RatePlanCandidates><RoomStayCandidates><RoomStayCandidate Quantity="' + numberOfRooms + '"><GuestCounts><GuestCount AgeQualifyingCode="10" Count="' + numberOfPersons + '"/><GuestCount Age="10" Count="10"/></GuestCounts></RoomStayCandidate></RoomStayCandidates></AvailRequestSegment></AvailRequestSegments></OTA_HotelAvailRQ>';
        var req = http.request(postRequest, function (res) {
        console.log(res.statusCode);
        res.on("data", function (data) {
            buffer += data;
        });
        res.on("end", function () {
            parseString(buffer, function (err, result) {
                (JSON.stringify(result));
                resultTransferData.push(result);
                console.log(resultTransferData);
            });
        });
    });
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });
    req.write(body);
    req.end();
};


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

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an 
    // error.
    console.error("Couldn't validate the signature.");
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

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  sendTextMessage(senderID, "Authentication successful");
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


function calculateStayRange(arrivalDate, departureDate) {

    arrivalDateSplitted = arrivalDate.split("-");
    departureDateSplitted = departureDate.split("-");
    stayRange = parseInt(departureDateSplitted[2] - arrivalDateSplitted[2]);
}

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

        console.log(cancelled);
        callSendAPI(messageData);
}

function calculatePrice(stayRange, numberOfRooms) {
        for (i = 0; i < stayRange; i++) {
            priceAllNightsDoppelzimmerDeluxeHolzleo += parseInt(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[1].Rates[0].Rate[i].Base[0].$.AmountAfterTax);
            priceAllNightsDoppelzimmerSuperiorSteinleo += parseInt(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[3].Rates[0].Rate[i].Base[0].$.AmountAfterTax);
            priceAllNightsEinzelzimmerSommerstein += parseInt(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[5].Rates[0].Rate[i].Base[0].$.AmountAfterTax);
            priceAllNightsDoppelzimmerClassicSteinleo += parseInt(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[7].Rates[0].Rate[i].Base[0].$.AmountAfterTax);
        }
        if (numberOfRooms > 1) {
            priceAllNightsDoppelzimmerDeluxeHolzleo *= numberOfRooms;
            priceAllNightsDoppelzimmerSuperiorSteinleo *= numberOfRooms;
            priceAllNightsEinzelzimmerSommerstein *= numberOfRooms;
            priceAllNightsDoppelzimmerClassicSteinleo *= numberOfRooms;
        } else if (numberOfRooms < 1) {
            priceAllNightsDoppelzimmerDeluxeHolzleo = priceAllNightsDoppelzimmerDeluxeHolzleo;
        }
}

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

    console.log(JSON.stringify(metadata));

    // You may get a text or attachment but not both
    var messageText = message.text;
    var messageAttachments = message.attachments;
    var quickReply = message.quick_reply;



    if (isEcho) {
        // Just logging message echoes to console
        console.log("Received echo for message %s and app %d with metadata %s",
            messageId, appId, metadata);
        return;



    } else if (quickReply) {

        var quickReplyPayload = quickReply.payload;

        console.log("Quick reply for message %s with payload %s",
            messageId, quickReplyPayload);

        if (quickReplyPayload === "1 person" || quickReplyPayload === "2 persons" || quickReplyPayload === "3 persons" || quickReplyPayload === "4 persons" || quickReplyPayload === "5 persons") {
            count++;
            if (count >= 1) {
                numberOfPersonsSplitted[0] = 0;
                numberOfRoomsSplitted[0] = 0;
                arrivalDate = 0;
                departureDate = 0;
                resultTransferData = [];
            }
            numberOfPersonsSplitted = quickReplyPayload.split(" ");
            numberOfPersons = parseInt(numberOfPersonsSplitted[0]);
            sendRoomRequest(senderID);
        } else if (quickReplyPayload === "1 room" || quickReplyPayload === "2 rooms" || quickReplyPayload === "3 rooms" || quickReplyPayload === "4 rooms" || quickReplyPayload === "5 rooms") {
            numberOfRoomsSplitted = quickReplyPayload.split(" ");
            numberOfRooms = parseInt(numberOfRoomsSplitted[0]);
            sendArrivalDateMonth(senderID);
        } else if (quickReplyPayload === "mehr1") {
            sendArrivalDateMonth2(senderID);
        } else if (quickReplyPayload === "01" || quickReplyPayload === "02" || quickReplyPayload === "03" || quickReplyPayload === "04" || quickReplyPayload === "05" || quickReplyPayload === "06" || quickReplyPayload === "07" || quickReplyPayload === "08" || quickReplyPayload === "09" || quickReplyPayload === "10" || quickReplyPayload === "11" || quickReplyPayload === "12") {
            arrivalDateMonth = quickReplyPayload;
            sendArrivalDay(senderID);
        } else if (quickReplyPayload === "mehr2") {
            sendArrivalDay2(senderID);
        } else if (quickReplyPayload === "mehr3") {
            sendArrivalDay3(senderID);
        } else if (quickReplyPayload === "d 01" || quickReplyPayload === "d 02" || quickReplyPayload === "d 03" || quickReplyPayload === "d 04" || quickReplyPayload === "d 05" || quickReplyPayload === "d 06" || quickReplyPayload === "d 07" || quickReplyPayload === "d 08" || quickReplyPayload === "d 09" || quickReplyPayload === "d 10" || quickReplyPayload === "d 11" || quickReplyPayload === "d 12" || quickReplyPayload === "d 13" || quickReplyPayload === "d 14" || quickReplyPayload === "d 15" || quickReplyPayload === "d 16" || quickReplyPayload === "d 17" || quickReplyPayload === "d 18" || quickReplyPayload === "d 19" || quickReplyPayload === "d 20" || quickReplyPayload === "d 21" || quickReplyPayload === "d 22" || quickReplyPayload === "d 23" || quickReplyPayload === "d 24" || quickReplyPayload === "d 25" || quickReplyPayload === "d 26" || quickReplyPayload === "d 27" || quickReplyPayload === "d 28" || quickReplyPayload === "d 29" || quickReplyPayload === "d 30" || quickReplyPayload === "d 31") {
            arrivalDayDateSplitted = quickReplyPayload.split(" ");
            arrivalDateDay = arrivalDayDateSplitted[1];
            arrivalDateDayCalculations = parseInt(arrivalDayDateSplitted[1]);
            arrivalDate = "2017-" + arrivalDateMonth + "-" + arrivalDateDay;
            sendDepartureDateSuggestion(senderID);
        } else if (quickReplyPayload === "2017" + "-" + arrivalDateMonth + "-" + (arrivalDateDayCalculations + 1) || quickReplyPayload === "2017" + "-" + arrivalDateMonth + "-" + (arrivalDateDayCalculations + 2) || quickReplyPayload === "2017" + "-" + arrivalDateMonth + "-" + (arrivalDateDayCalculations + 3) || quickReplyPayload === "2017" + "-" + arrivalDateMonth + "-" + (arrivalDateDayCalculations + 4) || quickReplyPayload === "2017" + "-" + arrivalDateMonth + "-" + (arrivalDateDayCalculations + 5)) {
            sendStatusFeedbackRequest(senderID);
            departureDate = quickReplyPayload;
            calculateStayRange(arrivalDate, departureDate);
            sendXmlPostRequest(numberOfRooms, numberOfPersons, arrivalDate, departureDate, doppelzimmerClassicSteinleo_StandardRateHP, einzelzimmerSommerstein_StandardRateHP, doppelzimmerDeluxeHolzleo_ShortHP, doppelzimmerSuperiorSteinleo_StandardRateHP);
            setTimeout(function () {
                        console.log("Should cancel here!");
                        if (parseInt(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[1].Rates[0].Rate[i].Base[0].$.AmountAfterTax) > 1000 || parseInt(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[3].Rates[0].Rate[i].Base[0].$.AmountAfterTax) > 1000 || parseInt(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[5].Rates[0].Rate[i].Base[0].$.AmountAfterTax) > 1000 || parseInt(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[7].Rates[0].Rate[i].Base[0].$.AmountAfterTax) > 1000) {
                            setTimeout(sendErrorMessageNoRoom, 1500, senderID);
                            cancelled = true;
                            if (cancelled) {
                                console.log("Should cancel here!");
                            } else {
                                setTimeout(calculatePrice, 3000, stayRange);
                                setTimeout(checkTypeOfOffer, 12000, senderID);
                            }
                        }
                    }, 1500);
                }
    }

    if (messageText) {

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

            default:
                break;
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
function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  console.log("Received account link event with for user %d with status %s " +
    "and auth code %s ", senderID, status, authCode);
}


/*
 * Send a text message using the Send API.
 *
 */
function sendPersonalFeedback(recipientId) {
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
                    text: "Hallo & Willkommen beim Chatbot vom Hotel Salzburger Hof Leogang - #homeofsports. Wie darf ich Ihnen helfen?",
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
                    "title":(arrivalDateDayCalculations + 1) + "." + arrivalDateMonth + "." + "2017",
                    "payload":"2017"+ "-" + arrivalDateMonth + "-" + (arrivalDateDayCalculations + 1)
                },
                {
                    "content_type":"text",
                    "title":(arrivalDateDayCalculations + 2) + "." + arrivalDateMonth + "." + "2017",
                    "payload":"2017"+ "-" + arrivalDateMonth + "-" + (arrivalDateDayCalculations + 2)
                },
                {
                    "content_type":"text",
                    "title":(arrivalDateDayCalculations + 3) + "." + arrivalDateMonth + "." + "2017",
                    "payload":"2017"+ "-" + arrivalDateMonth + "-" + (arrivalDateDayCalculations + 3)
                },
                {
                    "content_type":"text",
                    "title":(arrivalDateDayCalculations + 4) + "." + arrivalDateMonth + "." + "2017",
                    "payload":"2017"+ "-" + arrivalDateMonth + "-" + (arrivalDateDayCalculations + 4)
                },
                {
                    "content_type":"text",
                    "title":(arrivalDateDayCalculations + 5) + "." + arrivalDateMonth + "." + "2017",
                    "payload":"2017"+ "-" + arrivalDateMonth + "-" + (arrivalDateDayCalculations+ + 5)
                }
            ]
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a button message using the Send API.
 *
 */
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
          text: "Menü Auswahl",
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

/*
 * Send a button message using the Send API.
 *
 */
function sendPersonRequest(recipientId) {
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
            sendGenericMessageOffer4(senderID);
            break;
        case "1|5":
            break;
        case "2|1":
            break;
        case "2|2":
            break;
        case "2|3":
            sendGenericMessageOffer5(senderID);
            break;
        case "2|4":
            sendGenericMessageOffer4(senderID);
            break;
        case "2|5":
            break;
        case "3|1":
            break;
        case "3|2":
            break;
        case "3|3":
            break;
        case "3|4":
            break;
        case "3|5":
            break;
        case "4|1":
            break;
        case "4|2":
            break;
        case "4|3":
            break;
        case "4|4":
            break;
        case "5|5":
            break;
        case "5|1":
            break;
        case "5|2":
            break;
        case "5|3":
            break;
        case "5|4":
            break;
        case "5|5":
            break;
    }
}

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
                            title: String(numberOfRooms) + " " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomTypes[0].RoomType[4].RoomDescription[0].$.Name) + " / " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.Start + " bis " + resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.End),
                            subtitle: String(priceAllNightsEinzelzimmerSommerstein) + ",00 EUR  /  "  + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[5].Rates[0].Rate[0].TPA_Extensions[0].Descriptions[0].Description[0].Text[1]._),
                            item_url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Einzelzimmer-Sommerstein1-1.9.png",
                            buttons: [{
                                type: "web_url",
                                url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                                title: "Open Web URL"
                            }, {
                                type: "postback",
                                title: "Details",
                                payload: "3"
                            }]
                        }
                    ]
                }
            }
        }
    };

    callSendAPI(messageData);
}

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
                        title: String(numberOfRooms) + " " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomTypes[0].RoomType[0].RoomDescription[0].$.Name) + " / " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.Start + " bis " + resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.End),
                        subtitle: String(priceAllNightsDoppelzimmerDeluxeHolzleo) + ",00 EUR  /  "  + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[1].Rates[0].Rate[0].TPA_Extensions[0].Descriptions[0].Description[0].Text[1]._),
                        item_url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                        image_url: "https://gettagbag.com/wp-content/uploads/2017/04/zimmer_holzleo_uebersicht.jpg",
                        buttons: [{
                            type: "web_url",
                            url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                            title: "Jetzt buchen"
                        }, {
                            type: "postback",
                            title: "Details",
                            payload: "1"
                        }]
                    },
                        {
                            title: String(numberOfRooms) + " " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomTypes[0].RoomType[2].RoomDescription[0].$.Name) + " / " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.Start + " bis " + resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.End),
                            subtitle: String(priceAllNightsDoppelzimmerSuperiorSteinleo) + ",00 EUR  /  "  + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[3].Rates[0].Rate[0].TPA_Extensions[0].Descriptions[0].Description[0].Text[1]._),
                            item_url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-Superior-Steinleo.png",
                            buttons: [{
                                type: "web_url",
                                url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                                title: "Open Web URL"
                            }, {
                                type: "postback",
                                title: "Details",
                                payload: "3"
                            }]
                        },
                        {
                            title: String(numberOfRooms) + " " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomTypes[0].RoomType[6].RoomDescription[0].$.Name) + " / " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.Start + " bis " + resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.End),
                            subtitle: String(priceAllNightsDoppelzimmerClassicSteinleo) + ",00 EUR  /  "  + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[7].Rates[0].Rate[0].TPA_Extensions[0].Descriptions[0].Description[0].Text[1]._),
                            item_url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-classic-Steinleo.png",
                            buttons: [{
                                type: "web_url",
                                url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                                title: "Open Web URL"
                            }, {
                                type: "postback",
                                title: "Details",
                                payload: "3"
                            }]
                        },
                    ]
                }
            }
        }
    };

    callSendAPI(messageData);
}

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
                        title: String(numberOfRooms) + " " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomTypes[0].RoomType[6].RoomDescription[0].$.Name) + " / " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.Start + " bis " + resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.End),
                        subtitle: String(priceAllNightsDoppelzimmerClassicSteinleo) + ",00 EUR  /  "  + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[7].Rates[0].Rate[0].TPA_Extensions[0].Descriptions[0].Description[0].Text[1]._),
                        item_url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                        image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-classic-Steinleo.png",
                        buttons: [{
                            type: "web_url",
                            url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                            title: "Open Web URL"
                        }, {
                            type: "postback",
                            title: "Details",
                            payload: "3"
                        }]
                    },
                        {
                            title: String(numberOfRooms) + " " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomTypes[0].RoomType[4].RoomDescription[0].$.Name) + " / " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.Start + " bis " + resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.End),
                            subtitle: String(priceAllNightsEinzelzimmerSommerstein) + ",00 EUR + " + String(priceAllNightsDoppelzimmerClassicSteinleo) + ",00 EUR  = " + String(priceAllNightsDoppelzimmerClassicSteinleo + priceAllNightsEinzelzimmerSommerstein) +  + ",00 EUR / " +  + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[5].Rates[0].Rate[0].TPA_Extensions[0].Descriptions[0].Description[0].Text[1]._),
                            item_url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Einzelzimmer-Sommerstein1-1.9.png",
                            buttons: [{
                                type: "web_url",
                                url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                                title: "Open Web URL"
                            }, {
                                type: "postback",
                                title: "Details",
                                payload: "3"
                            }]
                        },

                    ]
                }
            }
        }
    };

    callSendAPI(messageData);
}

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
                        title: String(numberOfRooms) + " " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomTypes[0].RoomType[0].RoomDescription[0].$.Name) + " / " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.Start + " bis " + resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.End),
                        subtitle: String(priceAllNightsDoppelzimmerDeluxeHolzleo) + ",00 EUR  /  "  + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[1].Rates[0].Rate[0].TPA_Extensions[0].Descriptions[0].Description[0].Text[1]._),
                        item_url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                        image_url: "https://gettagbag.com/wp-content/uploads/2017/04/zimmer_holzleo_uebersicht.jpg",
                        buttons: [{
                            type: "web_url",
                            url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                            title: "Jetzt buchen"
                        }, {
                            type: "postback",
                            title: "Details",
                            payload: "1"
                        }]
                    },
                        {
                            title: String(numberOfRooms) + " " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomTypes[0].RoomType[2].RoomDescription[0].$.Name) + " / " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.Start + " bis " + resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.End),
                            subtitle: String(priceAllNightsDoppelzimmerSuperiorSteinleo) + ",00 EUR  /  "  + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[3].Rates[0].Rate[0].TPA_Extensions[0].Descriptions[0].Description[0].Text[1]._),
                            item_url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-Superior-Steinleo.png",
                            buttons: [{
                                type: "web_url",
                                url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                                title: "Open Web URL"
                            }, {
                                type: "postback",
                                title: "Details",
                                payload: "3"
                            }]
                        },
                        {
                            title: String(numberOfRooms) + " " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomTypes[0].RoomType[4].RoomDescription[0].$.Name) + " / " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.Start + " bis " + resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.End),
                            subtitle: String(priceAllNightsEinzelzimmerSommerstein) + ",00 EUR  /  "  + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[5].Rates[0].Rate[0].TPA_Extensions[0].Descriptions[0].Description[0].Text[1]._),
                            item_url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Einzelzimmer-Sommerstein1-1.9.png",
                            buttons: [{
                                type: "web_url",
                                url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                                title: "Open Web URL"
                            }, {
                                type: "postback",
                                title: "Details",
                                payload: "3"
                            }]
                        },
                        {
                            title: String(numberOfRooms) + " " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomTypes[0].RoomType[6].RoomDescription[0].$.Name) + " / " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.Start + " bis " + resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.End),
                            subtitle: String(priceAllNightsDoppelzimmerClassicSteinleo) + ",00 EUR  /  "  + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[7].Rates[0].Rate[0].TPA_Extensions[0].Descriptions[0].Description[0].Text[1]._),
                            item_url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-classic-Steinleo.png",
                            buttons: [{
                                type: "web_url",
                                url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                                title: "Open Web URL"
                            }, {
                                type: "postback",
                                title: "Details",
                                payload: "3"
                            }]
                        },
                    ]
                }
            }
        }
    };

    callSendAPI(messageData);
}

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
                            title: String(numberOfRooms) + " " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomTypes[0].RoomType[4].RoomDescription[0].$.Name) + " / " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.Start + " bis " + resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.End),
                            subtitle: String(priceAllNightsEinzelzimmerSommerstein) + ",00 EUR  /  "  + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[5].Rates[0].Rate[0].TPA_Extensions[0].Descriptions[0].Description[0].Text[1]._),
                            item_url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Einzelzimmer-Sommerstein1-1.9.png",
                            buttons: [{
                                type: "web_url",
                                url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
                                title: "Open Web URL"
                            }, {
                                type: "postback",
                                title: "Details",
                                payload: "3"
                            }]
                        },
                    ]
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a message with Quick Reply buttons.
 *
 */


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
 *
 */
function callSendAPI(messageData) {
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
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });  
}

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// app.listen(8000, function () {
//   console.log('Example app listening on port 8000!');
// });

module.exports = app;
