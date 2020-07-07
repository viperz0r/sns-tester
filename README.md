# Project Goal

The goal of this project is to help testing AWS SNS service.

It will create a subscription on the chosen topic and display the messages received on terminal.

Since it uses ngrok, you can access it's UI and inspect the incoming requests.
<br/><br/>

## Installation

> npm install

<br/>

## Configuring

1. make a copy of config/config.tpl.js and rename it to config.js

   > cp config/config.tpl.js config.js

2. Edit the created file and enter the appropriate information on AWS and SNS keys.

<br/>

## Running

Just type:

> npm start

<br>

## How to stop

Press **CTRL + C** to gracefully stop the program. This way the subscription is cleanup from SNS.

<br/>

## Advanced

You can pass more options to SNS and ngrok, by declaring them on config.json.
