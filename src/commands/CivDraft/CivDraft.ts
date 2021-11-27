import { Command, Args, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

import { MessageEmbed } from 'discord.js';
import type { Message } from 'discord.js';

import {
  HELP_MESSAGE,
  MODES,
  MODE_REGEX,
  TEAM_SIZE_REGEX,
  generateDraft,
  generateEmbedForDraft
} from "../../util/CivDrafting";

@ApplyOptions<CommandOptions>({
  name: 'civdraft',
  aliases: ['draft'],
  description: 'Use this commmand to draft civs for 2 teams'
})
export class CivDraftCommand extends Command {
  protected draftInProgress = false;
  public async messageRun(message: Message, args: Args) {
    let responseEmbed
    let msg;
    try {
      const draftMode = await args.pick('string');
      const teamSize = await args.pick('string');
      console.log(draftMode, teamSize, MODES[<keyof typeof MODES>draftMode]);

      if (!TEAM_SIZE_REGEX.test(teamSize) || !MODE_REGEX.test(draftMode)) {
        throw new Error('Invalid draft mode or team size');
      }

      const { team1civs, team2civs } = generateDraft(draftMode, teamSize);

      responseEmbed = generateEmbedForDraft(team1civs, team2civs);
      msg = await message.channel.send({ embeds: [responseEmbed] });
    } catch (error) {
      console.log("Error", error);
      let responseEmbed = new MessageEmbed();
      responseEmbed
        .setTitle('Please specify mode and team size properly')
        .setColor('#0099ff')
        .setDescription(HELP_MESSAGE)
      msg = await message.channel.send({ embeds: [responseEmbed] });
    }
    return msg;
  }
}
