// Invite using https://discord.com/oauth2/authorize?client_id=913052297087582238&permissions=2214849600&scope=bot
const TOKEN = process.env.TOKEN;

import { LogLevel, SapphireClient } from '@sapphire/framework';

const client = new SapphireClient({
  defaultPrefix: '!',
  intents: [
    'GUILDS',
    'GUILD_MESSAGES'
  ],
  logger: {
		level: LogLevel.Debug
	},
});

// TODO: Move token to env
void client.login(TOKEN);

const main = async () => {
	try {
		client.logger.info('Logging in...');
		await client.login();
		client.logger.info('Logged in; Bot is alive');  
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();