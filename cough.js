require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
//initialize bot by connecting to the server
client.login(process.env.DISCORD_TOKEN);

client.on('message', msg => {


});
