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


var result = '';
var app = express();
app.set('port', process.env.PORT || 8000);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));

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

/*further categories:
 420420 - '100.00' - Einzelzimmer Sommerstein
 420422 - '175.00' - Einzelnutzung Classic Steinleo
 420424 - '214.00' - Doppelzimmer Classic Steinleo
 420426 - '228.00' - Doppelzimmer Superior Steinleo
 420428 - '244.00' - Doppelzimmer Deluxe Holzleo
 420430 - '999.99' - Deluxe Asitz Allgergiker Stein
 420432 - '999.99' - Familienzimmer Birnhorn Steinl
 420434 - '999.99' - Familienzimmer Spielberg Holzl
 420436 - '999.99' - Suite Mitterhorn Steinleo
 420582 - '175.00' - Einzelnutzung Classic Steinleo
 420584 - '999.99' - Suite Mitterhorn Steinleo
 420586 - '999.99' - Familienzimmer Spielberg Holzl
 420588 - '999.00' - Familienzimmer Birnhorn Steinl
 420590 - '244.00' - Doppelzimmer Deluxe Holzleo
 420592 - '228.00' - Doppelzimmer Superior Steinleo
 420594 - '214.00' - Doppelzimmer Classic Steinleo
 420596 - '100.00' - Einzelzimmer Sommerstein
 432202 - Doppelzimmer Classic Steinleo_Standard Rate HP
 432204 - Doppelzimmer Classic Steinleo_Breakfast include rates
 432208 - Einzelzimmer Sommerstein_Standard Rate HP
 432210 - Einzelzimmer Sommerstein_Breakfast include rates
 432214 - Doppelzimmer Superior Steinleo_Standard Rate HP
 432216 - Doppelzimmer Superior Steinleo_Breakfast include rates
 432220 - Doppelzimmer Deluxe Holzleo_Standard Rate HP
 432222 - Doppelzimmer Deluxe Holzleo_Breakfast include rates
 432418 - Einzelzimmer Sommerstein_HRS_seasional rate
 432420 - Doppelzimmer Classic Steinleo_HRS_seasional rate
 432434 - Doppelzimmer Deluxe Holzleo_Std. Rate non xml
 432436 - Doppelzimmer Deluxe Holzleo_Std. Rate non xml 1
 433926 - Familienzimmer Birnhorn HP
 498254 - Einzelzimmer HOT DEAL - breakfast
 498256 - Doppelzimmer HOT DEAL - breakfast
 532584 - Doppelzimmer Classic Steinleo_Short Stay HP
 532588 - Doppelzimmer Classic Steinleo_Breakfast include rates Short Stay
 532604 - Doppelzimmer Classic Steinleo_Long Stay HP
 532606 - Doppelzimmer Classic Steinleo_Breakfast include rates Long Stay
 532612 - Einzelzimmer Sommerstein_Short Stay HP
 532614 - Einzelzimmer Sommerstein_Breakfast include rates Short  Stay
 532662 - Einzelzimmer Sommerstein_Long Stay HP
 532664 - Einzelzimmer Sommerstein_Breakfast include rates Long Stay
 532666 - Doppelzimmer Superior Steinleo_Short Stay
 532668 - Doppelzimmer Superior Steinleo_Breakfast include rates Short Stay
 532670 - Doppelzimmer Superior Steinleo_Long Stay HP
 532672 - Doppelzimmer Superior Steinleo_Breakfast include rates Long Stay
 532674 - Doppelzimmer Deluxe Holzleo_Short HP
 532676 - Doppelzimmer Deluxe Holzleo_Breakfast include rates short Stay
 532712 - Doppelzimmer Deluxe Holzleo_Long HP
 532714 - Doppelzimmer Deluxe Holzleo_Breakfast include rates Long Stay
 579384 - [COPY] Einzelzimmer Sommerstein
 516234 - EZ Sommerstein HRS
 516236 - DZ Steinleo HRS

 */
var result = '';
var buffer = '';
var resultTransferData = [];
var x = '';
var roomIds = [420420, 420422, 420424, 420426];

function sendXmlPostRequest(senderID) {

    var postRequest = {
        hostname: "cultswitch.cultuzz.de",
        path: "/cultswitch/processOTA",
        method: "POST",
        port: 8080,
        headers: {
            'Cookie': 'cookie',
            'Content-type': 'application/x-www-form-urlencoded',
        }
    };

    for (var i = 0; i < roomIds.length; i++) {
        let body = 'otaRQ=<?xml version="1.0" encoding="UTF-8"?><OTA_HotelAvailRQ xmlns="http://www.opentravel.org/OTA/2003/05" Version="3.30" TimeStamp="2011-07-12T05:59:49" PrimaryLangID="de"><POS><Source AgentSine="49082" AgentDutyCode="513f3eb9b082756f"><RequestorID Type="10" ID="50114" ID_Context="CLTZ"/><BookingChannel Type="7"/></Source></POS><AvailRequestSegments><AvailRequestSegment ResponseType="RateInfoDetails" InfoSource="MyPersonalStay"><StayDateRange Start="' + x + '" End="2017-09-13"/><RatePlanCandidates><RatePlanCandidate RatePlanType="11" RatePlanID="' + roomIds[i] + '"/> </RatePlanCandidates><RoomStayCandidates><RoomStayCandidate Quantity="2"><GuestCounts><GuestCount AgeQualifyingCode="10" Count="1"/><GuestCount Age="10" Count="10"/></GuestCounts></RoomStayCandidate></RoomStayCandidates></AvailRequestSegment></AvailRequestSegments></OTA_HotelAvailRQ>';
        let req = http.request(postRequest, function (res) {
            console.log(res.statusCode);
            res.on("data", function (data) {
                buffer = buffer + data;
            });
            res.on("end", function (data) {
                parseString(buffer, function (err, result) {
                    (JSON.stringify(result));
                    resultTransferData.push(result);
                });
                console.log(resultTransferData);
            });
        });
        req.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });
        req.write(body);
        req.end();
    }
    console.log(senderID);
    //sendResultTransferDataToFbMessenger(senderID, resultTransferData);
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
      if (quickReplyPayload === "1person" || quickReplyPayload === "2persons" || quickReplyPayload === "3persons" || quickReplyPayload === "4persons" || quickReplyPayload === "5persons") {
          sendRoomRequest(senderID);
      } else if (quickReplyPayload === "1room" || quickReplyPayload === "2rooms" || quickReplyPayload === "3rooms" || quickReplyPayload === "4rooms" || quickReplyPayload === "5rooms") {
          sendArrivalDate(senderID);
      } else if (quickReplyPayload === "arrivalDate") {
          sendDepartureDate(senderID);
      } //else if (quickReplyPayload === "departureDate") {
       //   sendRequestToChannelmanager(senderID);
      //}
    return;
  }

  if (messageText) {

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (messageText) {

        case 'Menu':
            sendMenu(senderID);
            break;

        case 'quick reply':
            sendQuickReply(senderID);
            break;

        case '2017-09-12':
            x = messageText;
            console.log(x);
            sendXmlPostRequest(senderID);
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
          sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
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
    // var messageData = sendGenericMessage();
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
   else if (payload === "2") {
       sendGifMessage(senderID);
   }
   else if (payload === "Zimmer Anfrage") {
       sendPersonRequest(senderID);
   }

/*
   if (payload === "1" && messageData.message.attachment.payload.elements[0].title.indexOf("Einzelzimmer Sommerstein") >= 0) {
   sendRoomDetails1(senderID);
   } else if (payload === "1" && messageData.message.attachment.payload.elements[0].title.indexOf("Doppelzimmer Classic Steinleo") >= 0)  {
   sendRoomDetails2(senderID);
   } else if (payload === "1" && messageData.message.attachment.payload.elements[0].title.indexOf("Einzelnutzung Classic Steinleo") >= 0)  {
   sendRoomDetails3(senderID);
   } else if (payload === "1" && messageData.message.attachment.payload.elements[0].title.indexOf("Doppelzimmer Superior Steinleo") >= 0)  {
   sendRoomDetails4(senderID);
   }
*/
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
          buttons:[{
            type: "web_url",
            url: "https://www.salzburgerhof.eu",
            title: "Website"
          }, {
            type: "postback",
            title: "Zimmer Anfrage",
            payload: "Zimmer Anfrage"
          }, {
            type: "postback",
            title: "Info",
            payload: "Info"
          }]
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
                              "payload":"1person"
                          },
                          {
                              "content_type":"text",
                              "title":"2 Personen",
                              "payload":"2persons"
                          },
                          {
                              "content_type":"text",
                              "title":"3 Personen",
                              "payload":"3persons"
                          },
                          {
                              "content_type":"text",
                              "title":"4 Personen",
                              "payload":"4persons"
                          },
                          {
                              "content_type":"text",
                              "title":"5 Personen",
                              "payload":"5persons"
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
                    "payload":"1room"
                },
                {
                    "content_type":"text",
                    "title":"2 Zimmer",
                    "payload":"2rooms"
                },
                {
                    "content_type":"text",
                    "title":"3 Zimmer",
                    "payload":"3rooms"
                },
                {
                    "content_type":"text",
                    "title":"4 Zimmer",
                    "payload":"4rooms"
                },
                {
                    "content_type":"text",
                    "title":"5 Zimmer",
                    "payload":"5rooms"
                }
            ]
        }
    };
    callSendAPI(messageData);
}

function sendArrivalDate(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "Anreise Datum eingeben: (Bsp. 12-08-2017)",
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
}

function sendDepartureDate(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "Abreise Datum eingeben: (Bsp. 12-08-2017)",
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
function sendResultTransferDataToFbMessenger(recipientId, resultTransferData) {

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
            title: String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[0].$.NumberOfUnits) + " " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomTypes[0].RoomType[0].RoomDescription[0].$.Name) + " / " + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.Start + " bis " + resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.End),
            subtitle: String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[1].Rates[0].Rate[0].Base[0].$.AmountAfterTax) + "EUR  /  "  + String(resultTransferData[0].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[1].Rates[0].Rate[0].TPA_Extensions[0].Descriptions[0].Description[0].Text[1]._),
            item_url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Einzelzimmer-Sommerstein1-1.9.png",
            buttons: [{
              type: "web_url",
              url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
              title: "Jetzt buchen"
            }, {
              type: "postback",
              title: "Details",
              payload: "1"
            }]
          }, {
            title: String(resultTransferData[1].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[0].$.NumberOfUnits) + " " + String(resultTransferData[1].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomTypes[0].RoomType[0].RoomDescription[0].$.Name) + " / " + String(resultTransferData[1].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.Start + " bis " + resultTransferData[1].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.End),
              subtitle: String(resultTransferData[1].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[1].Rates[0].Rate[0].Base[0].$.AmountAfterTax) + "EUR  /  "  + String(resultTransferData[1].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[1].Rates[0].Rate[0].TPA_Extensions[0].Descriptions[0].Description[0].Text[1]._),
              item_url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-classic-Steinleo.png",
            buttons: [{
              type: "web_url",
              url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Details",
              payload: "2"
            }]
          },
          {
              title: String(resultTransferData[2].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[0].$.NumberOfUnits) + " " + String(resultTransferData[2].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomTypes[0].RoomType[0].RoomDescription[0].$.Name) + " / " + String(resultTransferData[2].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.Start + " bis " + resultTransferData[2].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.End),
              subtitle: String(resultTransferData[2].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[1].Rates[0].Rate[0].Base[0].$.AmountAfterTax) + "EUR  /  "  + String(resultTransferData[2].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[1].Rates[0].Rate[0].TPA_Extensions[0].Descriptions[0].Description[0].Text[1]._),
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
              title: String(resultTransferData[3].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[0].$.NumberOfUnits) + " " + String(resultTransferData[3].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomTypes[0].RoomType[0].RoomDescription[0].$.Name) + " / " + String(resultTransferData[3].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.Start + " bis " + resultTransferData[3].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].TimeSpan[0].$.End),
              subtitle: String(resultTransferData[3].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[1].Rates[0].Rate[0].Base[0].$.AmountAfterTax) + "EUR  /  "  + String(resultTransferData[3].OTA_HotelAvailRS.RoomStays[0].RoomStay[0].RoomRates[0].RoomRate[1].Rates[0].Rate[0].TPA_Extensions[0].Descriptions[0].Description[0].Text[1]._),
              item_url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
            image_url: "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-Superior-Steinleo.png",
            buttons: [{
              type: "web_url",
              url: "http://www.salzburgerhof.eu/de/zimmer-angebote/doppelzimmer/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Details",
              payload: "4"
            }]
          }

          ]
        }
      }
    }
  };

  for (var i = 0; i < resultTransferData.length; i++) {
      if (messageData.message.attachment.payload.elements[i].title.indexOf("Einzelzimmer Sommerstein") >= 0) {
          messageData.message.attachment.payload.elements[i].image_url = "https://gettagbag.com/wp-content/uploads/2017/04/Einzelzimmer-Sommerstein1-1.9.png";
      } else if (messageData.message.attachment.payload.elements[i].title.indexOf("Doppelzimmer Classic Steinleo") >= 0) {
          messageData.message.attachment.payload.elements[i].image_url = "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-classic-Steinleo.png";
      } else if (messageData.message.attachment.payload.elements[i].title.indexOf("Einzelnutzung Classic Steinleo") >= 0) {
          messageData.message.attachment.payload.elements[i].image_url = "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-classic-Steinleo.png";
      } else if (messageData.message.attachment.payload.elements[i].title.indexOf("Doppelzimmer Superior Steinleo") >= 0) {
          messageData.message.attachment.payload.elements[i].image_url = "https://gettagbag.com/wp-content/uploads/2017/04/Doppelzimmer-Superior-Steinleo.png";
      }
  }

  callSendAPI(messageData);
}


/*
 * Send a message with Quick Reply buttons.
 *
 */
function sendQuickReply(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "What's your favorite movie genre?",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Action",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
        },
        {
          "content_type":"text",
          "title":"Comedy",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
        },
        {
          "content_type":"text",
          "title":"Drama",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
        }
      ]
    }
  };

  callSendAPI(messageData);
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