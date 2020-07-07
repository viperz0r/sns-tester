module.exports = {
  APP: {
    PORT: 30123,
  },
  AWS: {
    region: "xxxxxxxxx",
    accessKeyId: "yyyyyyyyy",
    secretAccessKey: "zzzzzzzzz",
  },
  SNS_OPTIONS: {
    TopicArn: "arn:aws:sns:eu-west-1:12345678:EXAMPLE_TOPIC",
    Protocol: "https",
  },
  NGROK_OPTIONS: {},
};
