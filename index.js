const TelegramBot = require('node-telegram-bot-api');
var MailListener = require("mail-listener2");

if (!(process.env.TG_TOKEN && process.env.TG_CHATIDS && process.env.MAIL_USER && process.env.MAIL_PASSWORD && process.env.MAIL_HOST))
  process.exit(1);

const bot = new TelegramBot(process.env.TG_TOKEN, {polling: true});

const chatIds = [process.env.TG_CHATIDS];

bot.onText(/\/getId/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = msg.chat.id;
  console.log(msg.chat.id);

  bot.sendMessage(chatId, resp);
});

var mailListener = new MailListener({
  username: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
  host: process.env.MAIL_HOST,
  port: 993, // imap port
  tls: true,
  connTimeout: 10000, // Default by node-imap
  authTimeout: 5000, // Default by node-imap,
  debug: null, //console.log, // Or your custom function with only one incoming argument. Default: null
  tlsOptions: { rejectUnauthorized: false },
  mailbox: "INBOX", // mailbox to monitor
  searchFilter: ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved
  markSeen: true, // all fetched email willbe marked as seen and not fetched next time
  fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
  mailParserOptions: {streamAttachments: false}, // options to be passed to mailParser lib.
  attachments: false, // download attachments as they are encountered to the project directory
  attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
});

mailListener.start(); // start listening

// stop listening
//mailListener.stop();

mailListener.on("server:connected", function(){
  console.log("imapConnected");
});

mailListener.on("server:disconnected", function(){
  process.exit(2);
});

mailListener.on("error", function(err){
  process.exit(3);
});

mailListener.on("mail", function(mail, seqno, attributes){
  console.log("Получено новое сообщение!\n");
  console.log("От: " + mail.headers.from);
  console.log("Тема: " + mail.headers.subject);
  console.log("Текст: " + mail.text);
  console.log("Время: " + mail.headers.date);
  chatIds.forEach(function(value){
    bot.sendMessage(value, "*Получено новое сообщение!*\n\n*От*: " + mail.headers.from + "\n*Тема*: " + mail.headers.subject + "\n*Текст*: " + mail.text + "*Время*: " + mail.headers.date, {parse_mode: "markdown"});
  });
});
