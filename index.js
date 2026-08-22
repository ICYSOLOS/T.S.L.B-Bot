const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const keepAlive = require('./server');

const client = new Client({
    intents: [GatewayIntentBits.Guilds] // We only need Guilds intent for slash commands now
});

// Define your slash commands
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),

    new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot announcement and mention a role')
        .addRoleOption(option => 
            option.setName('target-role')
                .setDescription('The role you want to mention (or @everyone)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('message')
                .setDescription('The message content to send')
                .setRequired(true))
        // Optional: Restricts this command so only server managers/admins can use it
        .setDefaultMemberPermissions(PermissionFlagsBits.MentionEveryone) 
].map(command => command.toJSON());

// Register commands with Discord's systems when bot starts up
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('Started refreshing application (/) commands.');
        // This deploys commands globally to all servers your bot is in
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

// Handle command inputs from users
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply('Pong!');
    }

    if (commandName === 'say') {
        const role = interaction.options.getRole('target-role');
        const text = interaction.options.getString('message');

        // Discord treats @everyone role ID uniquely matching the Server ID
        const mentionText = role.id === interaction.guild.id ? '@everyone' : `<@&${role.id}>`;

        // Send the complete message announcement
        await interaction.reply({ 
            content: `${mentionText} ${text}`,
            allowedMentions: { parse: ['everyone', 'roles'] } // Explicitly allow bot to ping them
        });
    }
});

keepAlive();
client.login(process.env.DISCORD_TOKEN);
