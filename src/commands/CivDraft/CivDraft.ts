import { Command, Args, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

import { MessageEmbed } from 'discord.js';
import type { Message } from 'discord.js';

const TEAM_SIZE_REGEX = /^[1-7]v[1-7]$/;
const MODE_REGEX = /^(u)|(tu)|(r)$/;
const NUMBER_EMOJIS = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:'];
const UNKNOWN_EMOJI = ':1234:';

const MODES = {
  u: 1,
  tu: 2,
  r: 3
};

const HELP_MESSAGE = `
Supported modes are:
\`u\`: Unique civs - every player gets a unique civ.
\`tu\`: Team unique - every player on a team gets a unique civ. Mirroring is possible.
\`r\`: Random - every player gets a civ at random (best if positions are unknown).
\`d\`: Draft - civ draft mode, but it's unsupported at the moment.

Supported team sizes are:
\`1v1\`
\`2v2\`
\`3v3\`
\`4v4\`
\`XvX\` - for those challenge matches with uneven team sizes.

Example usage - \`!draft tu 3v3\`
`;

@ApplyOptions<CommandOptions>({
  name: 'civdraft',
  aliases: ['draft'],
  description: 'Use this commmand to draft civs for 2 teams'
})
export class CivDraftCommand extends Command {
  protected draftInProgress = false;
  public async messageRun(message: Message, args: Args) {
    const responseEmbed = new MessageEmbed();
    let msg;
    try {
      const draftMode = await args.pick('string');
      const teamSize = await args.pick('string');
      console.log(draftMode, teamSize, MODES[<keyof typeof MODES>draftMode]);

      if (!TEAM_SIZE_REGEX.test(teamSize) || !MODE_REGEX.test(draftMode)) {
        throw new Error('Invalid draft mode or team size');
      }

      const [team1civIds, team2civIds] = assignRandomCivs({
        mode: MODES[<keyof typeof MODES>draftMode],
        size: teamSize
      });

      const team1civs = civListToNames(team1civIds)?.map((civ, i) =>`${ NUMBER_EMOJIS[i * 2] || UNKNOWN_EMOJI }\`${civ}\``).join('  ') || "";
      const team2civs = civListToNames(team2civIds)?.map((civ, i) =>`${ NUMBER_EMOJIS[i * 2 + 1] || UNKNOWN_EMOJI }\`${civ}\``).join('  ') || "";
      console.log(team1civIds, team1civs);
      console.log(team2civIds, team2civs);

      responseEmbed
        .setTitle('Teams for the match')
        .setColor('#0099ff')
        .addField("Team 1", team1civs, false)
        .addField("Team 2", team2civs, false)
      msg = await message.channel.send({ embeds: [responseEmbed] });
    } catch (error) {
      console.log("Error", error);
      responseEmbed
        .setTitle('Please specify mode and team size properly')
        .setColor('#0099ff')
        .setDescription(HELP_MESSAGE)
      msg = await message.channel.send({ embeds: [responseEmbed] });
    }
    return msg;
  }
}

export const CIVILIZATIONS = [
  "Aztecs",
  "Berbers",
  "Britons",
  "Bulgarians",
  "Burgundians",
  "Burmese",
  "Byzantines",
  "Celts",
  "Chinese",
  "Cumans",
  "Ethiopians",
  "Franks",
  "Goths",
  "Huns",
  "Incas",
  "Indians",
  "Italians",
  "Japanese",
  "Khmer",
  "Koreans",
  "Lithuanians",
  "Magyars",
  "Malay",
  "Malians",
  "Mayans",
  "Mongols",
  "Persians",
  "Portuguese",
  "Saracens",
  "Sicilians",
  "Slavs",
  "Spanish",
  "Tatars",
  "Teutons",
  "Turks",
  "Vietnamese",
  "Vikings"
]

export const POCKETS = [1, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 15, 18, 20, 21, 23, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34];

export const FLANKS = [0, 2, 6, 7, 8, 10, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 27, 28, 29, 35, 36];

function getRandomCivList(civCount = 1, unique = true, useFullList = true, chooseFlanks = false, exclusionList: number[] = []) {
  const pool = useFullList ? [...FLANKS, ...POCKETS] : (chooseFlanks ? [...FLANKS] : [...POCKETS]);
  for (const excludedCiv of exclusionList) {
    pool.splice(pool.indexOf(excludedCiv), 1);
  }
  const civs = [];
  civCount = Math.min(8, civCount);
  while (civCount > 0) {
    const randomPos = Math.floor(Math.random() * pool.length);
    const [civ] = unique ? pool.splice(randomPos, 1) : [pool[randomPos]];
    civs.push(civ);
    civCount--;
  }
  return civs;
}

function splitArray(array: any[], chunk1Size: number, chunk2Size = array.length - chunk1Size) {
  const temp = array.slice();
  return [temp, temp.splice(chunk1Size, chunk2Size)];
}

/*
assignment modes
1: full unique - every player gets a unique civ
2: team unique - every player on a team gets a unique civ
3: true random - everyone gets a random civ, and repetition is possible
*/
function assignRandomCivs({
  mode = 2,
  size = "4v4"
}): number[][] {
  if (/[1-7][xv][1-7]/.test(size)) {
    const [teamASize, , teamBSize] = size.split('').map(Number)
    if (teamASize > 2 && teamBSize > 2 && mode < 3) {
      // there are always 2 flanks each side
      const flanks = (mode === 1) ? splitArray(getRandomCivList(4, true, false, true), 2, 2) : (
        [getRandomCivList(2, true, false, true), getRandomCivList(2, true, false, true)]
      );
      const flanksPool = [...flanks[0], ...flanks[1]];
      const pockets = (mode === 1) ? splitArray(getRandomCivList(teamASize + teamBSize - 4, true, false, false, flanksPool), teamASize - 2, teamBSize - 2) : (
        [getRandomCivList(teamASize - 2, true, false, false, flanksPool), getRandomCivList(teamBSize - 2, true, false, false, flanksPool)]
      );
      return [
        [flanks[0][0], ...pockets[0], flanks[0][1]],
        [flanks[1][0], ...pockets[1], flanks[1][1]]
      ]
    } else {
      mode = 3;
    }
    if (mode === 3) {
      const temp = getRandomCivList(teamASize + teamBSize, false);
      const output = splitArray(temp, teamASize, teamBSize);
      return output;
    }
  }
  return [[], []];
}

function civListToNames(team: number[]) {
  if (!team) {
    return null;
  }
  return team.map(i => CIVILIZATIONS[i])
}

function civListsToNames(teams: number[][] | null) {
  if (!teams) {
    return null;
  }
  const [teamA, teamB] = teams;
  return [
    teamA.map(i => CIVILIZATIONS[i]),
    teamB.map(i => CIVILIZATIONS[i])
  ];
}