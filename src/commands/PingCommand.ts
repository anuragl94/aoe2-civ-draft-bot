import { Command, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'ping',
  aliases: ['hi', 'ping'],
  description: 'Use this commmand to check if the bot is alive'
})
export class PingCommand extends Command {
  public async messageRun(message: Message) {
    const msg = await message.channel.send('Hi! Checking latency...');

    const content = `Hi! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${
      msg.createdTimestamp - message.createdTimestamp
    }ms.`;

    return msg.edit(content);
  }
}