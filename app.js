require('dotenv-extended').load();
var ssml = require('./ssml');
var builder = require('botbuilder'),
    restify = require('restify');
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, function (session,next) {
   // session.beginDialog('HelpDialog');
    var card = new builder.HeroCard(session)
        .title('Hey there! How can I help you today?');
    var msg = new builder.Message(session)
        .speak(speak(session, 'Hey there! How can I help you today?'))
        .addAttachment(card)
        .inputHint(builder.InputHint.acceptingInput);
    session.send(msg);
    // session.send(msg).endDialog();
}
);
var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

bot.dialog('nearest', function (session) {
    var msg = new builder.Message(session)
        .speak(speak(session, 'The nearest center is Bangsar'))
        .inputHint(builder.InputHint.acceptingInput);
    session.send(msg);//.endDialog();
   session.send('I heard');
          session.send(results.response);
  
}).triggerAction({ matches:/^hi/i });

function speak(session, prompt) {
    var localized = session.gettext(prompt);
    return ssml.speak(localized);
}

bot.dialog('feedback', function (session) {
    var azure = require('azure-storage');
    var queueSvc = azure.createQueueService('trialqueue', 'mCpXHxcpA8n2W/pBMJPg0gRMcUft/ECnd4J2NHz5ws6LrT37GgPOlAgJz4HLuhBVkt1Ghu05jNvC0yXQmcNHZg==');
  session.send('I heard');
          session.send(results.response.entity);
    queueSvc.createQueueIfNotExists('trialqueue', function (error, results, response) {
        
        
        if (!error) {
            // Queue created or exists
        }
    });
    queueSvc.createMessage('trialqueue', results.response.entity, function (error, results, response) {
        if (!error) {
            // Message inserted
        }
    });
    var msg = new builder.Message(session)
        .speak(speak(session, 'I am sorry to hear that. While I continue to learn, I will have our Service Rep get in touch with you soon. Have a good day ahead!'))
        .inputHint(builder.InputHint.acceptingInput);
    session.send(msg);//.endDialog();
}).triggerAction({ matches: /^no/i});
