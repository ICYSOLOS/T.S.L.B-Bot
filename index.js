const { Client, GatewayIntentBits } = require('discord.js');
const keepAlive = require('./server');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.content === '!ping') {
        message.reply('Pong!');
    }
});

// Starts the web server
keepAlive();

// Retrieves token securely from Render's Environment Variables
client.login(process.env.DISCORD_TOKEN);
