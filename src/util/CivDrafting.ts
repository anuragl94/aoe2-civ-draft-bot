import { MessageEmbed } from 'discord.js';

export const TEAM_SIZE_REGEX = /^[1-7]v[1-7]$/;
export const MODE_REGEX = /^(u)|(tu)|(r)$/;
export const NUMBER_EMOJIS = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:'];
export const UNKNOWN_EMOJI = ':1234:';

export const MODES = {
  u: 1,
  tu: 2,
  r: 3
};

export const HELP_MESSAGE = `
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
  "Vikings",
  "Poles",
  "Bohemians"
]

export const ONLY_FLANKS = [0, 2, 7, 10, 14, 16, 17, 19, 22, 24, 25, 36, 38];

export const ONLY_POCKETS = [1, 3, 4, 5, 9, 11, 15, 20, 26, 30, 31, 33, 34];

export const HYBRIDS = [6, 8, 12, 13, 18, 21, 23, 27, 28, 29, 32, 35, 37];

export const POCKETS = [...ONLY_POCKETS, ...HYBRIDS];

export const FLANKS = [...ONLY_FLANKS, ...HYBRIDS];

export function getRandomCivList(civCount = 1, unique = true, useFullList = true, chooseFlanks = false, exclusionList: number[] = []) {
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

export function splitArray(array: any[], chunk1Size: number, chunk2Size = array.length - chunk1Size) {
  const temp = array.slice();
  return [temp, temp.splice(chunk1Size, chunk2Size)];
}

/*
assignment modes
1: full unique - every player gets a unique civ
2: team unique - every player on a team gets a unique civ
3: true random - everyone gets a random civ, and repetition is possible
*/
export function assignRandomCivs({
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

export function civListToNames(team: number[]) {
  if (!team) {
    return null;
  }
  return team.map(i => CIVILIZATIONS[i])
}

export function generateDraft(draftMode: string, teamSize: string) {
  const [team1civIds, team2civIds] = assignRandomCivs({
    mode: MODES[<keyof typeof MODES>draftMode],
    size: teamSize
  });

  const team1civs = civListToNames(team1civIds)?.map((civ, i) =>`${ NUMBER_EMOJIS[i * 2] || UNKNOWN_EMOJI }\`${civ}\``).join('  ') || "";
  const team2civs = civListToNames(team2civIds)?.map((civ, i) =>`${ NUMBER_EMOJIS[i * 2 + 1] || UNKNOWN_EMOJI }\`${civ}\``).join('  ') || "";
  return {
    team1civs,
    team2civs
  };
}

export function generateEmbedForDraft(team1civs: string, team2civs: string) {
  const responseEmbed = new MessageEmbed();
  responseEmbed
    .setTitle('Teams for the match')
    .setColor('#0099ff')
    .addField("Team A", team1civs, false)
    .addField("Team B", team2civs, false)
    return responseEmbed;
}