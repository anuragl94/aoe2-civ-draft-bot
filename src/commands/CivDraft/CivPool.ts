import { Command, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import type { Message } from 'discord.js';

import { CIVILIZATIONS, FLANKS, POCKETS } from './CivDraft';

@ApplyOptions<CommandOptions>({
  name: 'civpool',
  aliases: ['pool', 'civs', 'civilizations'],
  description: 'Use this commmand to see all the civs in the pool'
})
export class CivPoolCommand extends Command {
  public async messageRun(message: Message) {
    const responseEmbed = new MessageEmbed();

    responseEmbed
      .setTitle('Civilizations in AoE2:DE pool')
      .setColor('#0099ff')
      .addField("Flanks", FLANKS.map((civ: number) => `\`${CIVILIZATIONS[civ]}\``).join(' '), false)
      .addField("Pockets", POCKETS.map((civ: number) => `\`${CIVILIZATIONS[civ]}\``).join(' '), false)

    return await message.channel.send({ embeds: [responseEmbed] });
  }
}