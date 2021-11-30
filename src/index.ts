// Invite using https://discord.com/oauth2/authorize?client_id=913052297087582238&permissions=2214849600&scope=bot
const TOKEN = process.env.TOKEN;
const TG_BOT_ID = '177022387903004673';

import { LogLevel, SapphireClient } from '@sapphire/framework';
import type { Message } from 'discord.js';

import {
  generateDraft,
  generateEmbedForDraft
} from "./util/CivDrafting";

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
    // this code listens to TG Bot and spits out random civs when teams are drafted
    client.on('messageCreate', async (message: Message) => {
      if (!(message.author.id === TG_BOT_ID)) return;
      try {
        const attachment = message.embeds[0];
        if (!/^__\*{2}\w+\*{2} has started!__$/.test(attachment?.title || "")) {
          return;
        }
        const isMapRandomCivs = attachment.fields.find(field => field.name === "Map")?.value.match(/(Random civs)/);
        if (isMapRandomCivs) {
          const teamA = attachment.fields.find(field => /\*\*A\*\*/.test(field?.name))?.value.match(/<@[0-9]+>/g);
          const teamB = attachment.fields.find(field => /\*\*B\*\*/.test(field?.name))?.value.match(/<@[0-9]+>/g);
          const { team1civs, team2civs } = generateDraft("tu", `${teamA?.length}v${teamB?.length}`);

          const responseEmbed = generateEmbedForDraft(team1civs, team2civs);
          message.reply({
            embeds: [responseEmbed],
            allowedMentions: { repliedUser: false }
          });
        } else {
          message.reply({
            content: 'Map doesn\'t specify random civs. Players may choose what they want. Or... captains may try Captains mode.',
            allowedMentions: { repliedUser: false },
            components: [
              {
                  type: 1,
                  components: [
                    {
                        type: 2,
                        label: "Captains mode",
                        style: 5,
                        url: "https://aoe2cm.net/preset/WXtOv"
                    }
                  ]
              }
            ]
          });
        }
      } catch (err) {
        console.log(err);
      }
    });
	} catch (error) {
    client.logger.fatal(error);
    client.destroy();
    process.exit(1);
  }
};

main();