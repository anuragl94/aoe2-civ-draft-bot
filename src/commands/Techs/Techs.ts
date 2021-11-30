import { Command, Args, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import type { Message } from 'discord.js';
// tslint:disable-next-line
import stringSimilarity from 'string-similarity';
import fetch from 'node-fetch';

import { CIVILIZATIONS } from '../../util/CivDrafting';
import { SNARKY_RESPONSES } from '../../util/Snarky';

@ApplyOptions<CommandOptions>({
  name: 'civpool',
  aliases: ['techs', 'techtree'],
  description: 'Use this commmand to see the tech tree of a civilization',
})
export class TechsCommand extends Command {
  public async messageRun(message: Message, args: Args) {
    let civName;

    try {
      civName = await args.pick('string');
      civName = civName.charAt(0).toUpperCase() + civName.slice(1).toLowerCase();
    } catch {
      return await message.channel.send("Please select a civilization");
    }

    const stringSimilarities = stringSimilarity.findBestMatch(civName, CIVILIZATIONS);
    const bestMatch = stringSimilarities.bestMatch;

    if (bestMatch.rating < 0.6) {
      const response = SNARKY_RESPONSES[Math.floor(Math.random() * SNARKY_RESPONSES.length)];
      return await message.channel.send(`${response}`);
    }

    const civ = bestMatch.target;
    const url = `https://aoe2techtree.net/?lng=en#${civ}`;
    let techs;
    try {
      techs = await fetchCivilizationTechs(civ);
    } catch(err) {
      console.log(err);
      techs = "... Error fetching techs";
      const response = `${url} \n\`\`\`${techs}\`\`\``;
    
      return await message.channel.send(response);
    }

    const responseEmbed = new MessageEmbed();
    responseEmbed
      .setTitle(`${civ} Tech Tree`)
      .setColor('#0099ff')
      .setDescription(`${techs.army_type} civilization`)
      .addField('Castle Unit', `${techs.unique_unit.name} (${Object.entries(techs.unique_unit.cost).map(e => e[1] + e[0].toLowerCase()).join(", ")}) :crossed_swords: ${techs.unique_unit.attack}, :shield: ${techs.unique_unit.armor}, :bow_and_arrow: ${techs.unique_unit.range || 0}
Build Time ${techs.unique_unit.build_time}s, Reload Time ${techs.unique_unit.reload_time}, Movement Rate ${techs.unique_unit.movement_rate}, LOS ${techs.unique_unit.line_of_sight}
Attack bonuses: ${techs.unique_unit.attack_bonus.join(", ")}`)
      .addField('Unique Tech(s)', `${techs.unique_tech.name}\n${techs.unique_tech.description}
Available in ${techs.unique_tech.age} age
Costs ${Object.entries(techs.unique_tech.cost).map(e => e[1] + e[0].toLowerCase()).join(", ")}, ${techs.unique_tech.build_time}seconds`, true)
      .addField('Civilization Bonuses', techs.civilization_bonus.join("\n"), true)
      .addField('Team Bonus', techs.team_bonus);

    return await message.reply({
      content: url,
      embeds: [ responseEmbed ]
    });
  }
}

async function fetchCivilizationTechs(civ: string) {
  const apiUrl = `https://age-of-empires-2-api.herokuapp.com/api/v1/civilization/${civ}`;
  const techs: any = await fetch(apiUrl).then(res => res.json());
  techs.unique_unit = await fetch(techs.unique_unit).then(res => res.json());
  techs.unique_tech = techs.unique_tech.map(async (url: string) => await fetch(url).then(res => res.json()));
  return techs;
}