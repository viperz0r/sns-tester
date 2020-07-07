// Require the framework and instantiate it
const ngrok = require("ngrok");
const AWS = require("aws-sdk");
const fastify = require("fastify")({ logger: false });
const config = require("./config/config");
let SNS = null;
let subscriptionArn = null;
let cleaning = false;

// Declare a route
fastify.post("/", processMessage);

start();

async function start() {
  try {
    await fastify.listen(config.APP.PORT);
    console.log(`server listening on ${fastify.server.address().port}\n`);
    const url = await ngrok.connect({
      addr: config.APP.PORT,
    });
    console.log(`Ngrok URL - ${url} \n`);
    console.log(`Ngrok UI - http://127.0.0.1:4040 \n`);
    initSNS(config.AWS);
    await subscribeTopic({ ...config.SNS_OPTIONS, ...{ Endpoint: url } });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

function initSNS(options) {
  // Init SNS and subscribe to events
  SNS = new AWS.SNS(options);
}

async function subscribeTopic(options) {
  await SNS.subscribe(options)
    .promise()
    .catch((err) => {
      console.log(err);
    });
  console.log("Subscription started. Waiting for confirmation...");
}

async function unsubscribeTopic(subscriptionArn) {
  const params = { SubscriptionArn: subscriptionArn };
  await SNS.unsubscribe(params)
    .promise()
    .catch((err) => {
      console.log(err);
    });
  console.log("\nTopic unsubscribed.");
}

async function processMessage(req, reply) {
  try {
    req.body = JSON.parse(req.body);

    if (req.body.Type === "SubscriptionConfirmation") {
      const result = await SNS.confirmSubscription({
        TopicArn: config.SNS_OPTIONS.TopicArn,
        Token: req.body.Token,
      }).promise();
      subscriptionArn = result.SubscriptionArn;
      console.log("\nSubscription confirmed! Ready to receive messages.");
    } else if (req.body.Type === "Notification") {
      const { Timestamp, Message, MessageAttributes } = req.body;

      let notification = {
        timestamp: Timestamp,
        message: Message,
        attributes: MessageAttributes,
      };

      try {
        notification.message = JSON.parse(Message);
      } catch (error) {
        // do nothing, it´s not a valid JSON
      }

      console.log("\nMessage Received:");
      console.log(JSON.stringify(notification, null, 2));
    }

    reply.code(200).send();
  } catch (error) {
    console.log(error);
    reply
      .status(500)
      .send({ errorMessage: error.message, errorStack: error.stack });
  }
}

async function cleanup() {
  if (cleaning) return;
  cleaning = true;
  console.log("\nCaught interrupt signal. Cleaning up...");
  await unsubscribeTopic(subscriptionArn);
  console.log("\nAll done, have a nice day :)");
  process.exit();
}

process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);
process.on("uncaughtException", cleanup);
