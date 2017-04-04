const Bot = require('./lib/Bot');
const FeedPoller = require('./lib/FeedPoller');
const SOFA = require('sofa-js');

let bot = new Bot();
let poller = new FeedPoller(bot);
const NAME = 'Week in Ethereum News';

const CONTROLS = {
  subscribe: {
    type: 'button',
    label: 'Subscribe to the newsletter 📩',
    value: 'subscribe'
  },
  unsubscribe: {
    type: 'button',
    label: 'Unsubscribe 👋',
    value: 'unsubscribe'
  },
  tip: {
    type: 'button',
    label: 'Tip 💸',
    value: 'tip'
  }
};

bot.onEvent = function(session, message) {
  console.log(message.type)
  switch (message.type) {
    case "Init":
      welcome(session);
      break;
    case "Message":
      onMessage(session, message);
      break;
    case "Command":
      onCommand(session, message);
      break;
    case "Payment":
      onPayment(session);
      break;
  }
};

function onMessage(session, message) {
  if (session.get('subscribed')) {
    latest(session);
  } else {
    welcome(session);
  }
};

function onCommand(session, command) {
  switch (command.content.value) {
    case 'tip':
      tip(session)
      break
    case 'subscribe':
      subscribe(session)
      break
    case 'unsubscribe':
      unsubscribe(session)
      break
    }
};

function onPayment(session) {
  let message = `Thank you for supporting '${NAME}' 🙏`;
  sendMessage(session, message);
};

function welcome(session) {
  let message = `Hi! Welcome to '${NAME}'. We keep you up to date with what's happening in the Ethereum community. Tap 'Subscribe' to get started.`;
  sendMessage(session, message);
};

function latest(session) {
  // Default response for subscribed users
  let article = poller.getLatestArticle();
  let message = `Hey! Check out the latest issue of '${NAME}': ${article.link}`;
  sendMessage(session, message);
};

function tip(session) {
  // TODO: allow donating a custom amount
  session.requestEth(0.1, `Tip to '${NAME}'`)
};

function subscribe(session) {
  session.set('subscribed', true)
  poller.addUser(session);
  let article = poller.getLatestArticle();
  let message = `Thank you for subscribing 🙌. This is a weekly newsletter, so you will receive your next update within a week. For now, check out the latest issue: ${article.link}`;
  sendMessage(session, message);
};

function unsubscribe(session) {
  session.set('subscribed', false);
  poller.removeUser(session);
  let message = '😭 sorry to see you go. We hope you come back!'
  sendMessage(session, message);
};

function sendMessage(session, message) {
  let controls = [];
  if (session.get('subscribed')) {
    controls = [
      CONTROLS.tip,
      CONTROLS.unsubscribe
    ];
  } else {
    controls = [CONTROLS.subscribe];
  }
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }));
}
