import Image from "next/image";
import { MatchHistory } from "@/components/match-history";
import { PlayerStats } from "@/components/player-stats";
import { DDRAGON_BASE_URL } from "@/lib/constants";

async function getPlayerData(region: string, name: string, tag: string) {
  const apiKey = process.env.RIOT_API_KEY;

  if (!apiKey) {
    throw new Error("API key not configured");
  }

  try {
    // First get account info using name and tag
    const accountResponse = await fetch(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tag}`,
      {
        headers: {
          "X-Riot-Token": apiKey,
        },
      }
    );

    if (!accountResponse.ok) {
      throw new Error("Summoner not found");
    }

    const accountData = await accountResponse.json();

    // Get the regional API URL based on the region parameter
    const regionApiUrl = getRegionApiUrl(region);

    // Get summoner info using PUUID
    const summonerResponse = await fetch(
      `${regionApiUrl}/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}`,
      {
        headers: {
          "X-Riot-Token": apiKey,
        },
      }
    );

    if (!summonerResponse.ok) {
      throw new Error("Failed to fetch summoner details");
    }

    const summonerData = await summonerResponse.json();
    console.log("Summoner Data:", JSON.stringify(summonerData, null, 2));

    // Get ranked info
    const rankedResponse = await fetch(
      `${regionApiUrl}/lol/league/v4/entries/by-summoner/${summonerData.id}`,
      {
        headers: {
          "X-Riot-Token": apiKey,
        },
      }
    );

    if (!rankedResponse.ok) {
      throw new Error("Failed to fetch ranked details");
    }

    const rankedData = await rankedResponse.json();
    console.log("Ranked Data:", JSON.stringify(rankedData, null, 2));

    // Get match history
    const matchesResponse = await fetch(
      `https://${getRegionRoute(
        region
      )}.api.riotgames.com/lol/match/v5/matches/by-puuid/${
        accountData.puuid
      }/ids?start=0&count=20`,
      {
        headers: {
          "X-Riot-Token": apiKey,
        },
      }
    );

    if (!matchesResponse.ok) {
      throw new Error("Failed to fetch match history");
    }

    const matchIds = await matchesResponse.json();

    // Fetch details for each match
    const matchDetails = await Promise.all(
      matchIds.map(async (matchId: string) => {
        const matchResponse = await fetch(
          `https://${getRegionRoute(
            region
          )}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
          {
            headers: {
              "X-Riot-Token": apiKey,
            },
          }
        );
        if (!matchResponse.ok) return null;
        return matchResponse.json();
      })
    );

    return {
      summoner: summonerData,
      ranked: rankedData,
      region: region.toUpperCase(),
      tagLine: tag,
      matches: matchDetails.filter(Boolean), // Remove any null values from failed requests
    };
  } catch (error) {
    console.error("Error fetching player data:", error);
    throw error;
  }
}

function getRegionApiUrl(region: string): string {
  const regionMapping: Record<string, string> = {
    na: "https://na1.api.riotgames.com",
    euw: "https://euw1.api.riotgames.com",
    eun: "https://eun1.api.riotgames.com",
    // Add more regions as needed
  };

  return regionMapping[region.toLowerCase()] || regionMapping["na"];
}

function getRegionRoute(region: string): string {
  const regionMapping: Record<string, string> = {
    na: "americas",
    euw: "europe",
    eun: "europe",
    // Add more regions as needed
  };

  return regionMapping[region.toLowerCase()] || regionMapping["na"];
}

export default async function PlayerProfile({
  params,
}: {
  params: {
    region: string;
    name: string;
    tag: string;
  };
}) {
  const { region, name: encodedName, tag } = await Promise.resolve(params);
  const name = decodeURIComponent(encodedName);
  const data = await getPlayerData(region, name, tag);

  const soloQueue = data.ranked.find(
    (queue: any) => queue.queueType === "RANKED_SOLO_5x5"
  );
  const flexQueue = data.ranked.find(
    (queue: any) => queue.queueType === "RANKED_FLEX_SR"
  );

  return (
    <div className="container mx-auto space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Overview */}
        <div className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
          <div className="flex items-center gap-4">
            <div className="relative h-32 w-32">
              <Image
                src={`${DDRAGON_BASE_URL}/img/profileicon/${data.summoner.profileIconId}.png`}
                alt="Profile Icon"
                className="rounded-lg"
                width={128}
                height={128}
              />
              <div className="absolute bottom-0 right-0 rounded-full bg-slate-900/60 px-2 py-1 text-xs">
                {data.summoner.summonerLevel}
              </div>
            </div>
            <div>
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="text-blue-100">{name}</span>
                  <span className="text-slate-400">#{tag}</span>
                </h1>
                <span className="text-sm text-slate-400">
                  {region.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Last updated:{" "}
                {new Date(data.summoner.revisionDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Ranked Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Solo Queue */}
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <h3 className="mb-2 font-semibold text-blue-100">
              Ranked Solo/Duo
            </h3>
            <div className="h-32">
              {" "}
              {/* Added wrapper with fixed height for both states */}
              {soloQueue ? (
                <div className="flex h-full flex-row-reverse">
                  <div className="flex w-1/2 items-center justify-center">
                    <Image
                      src={`/rank_images/${soloQueue.tier}.png`}
                      alt={`${soloQueue.tier} Rank`}
                      className="object-contain"
                      width={150}
                      height={150}
                    />
                  </div>
                  <div className="flex w-1/2 flex-col justify-center">
                    <p className="text-lg font-bold truncate">{`${soloQueue.tier} ${soloQueue.rank}`}</p>
                    <p className="text-sm text-slate-400">{`${soloQueue.leaguePoints} LP`}</p>
                    <div className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                      <span className="text-green-400">{soloQueue.wins}W</span>
                      <span className="text-red-400">{soloQueue.losses}L</span>
                      <span className="text-slate-400">
                        (
                        {Math.round(
                          (soloQueue.wins /
                            (soloQueue.wins + soloQueue.losses)) *
                            100
                        )}
                        %)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center">
                  <div className="w-full">
                    <p className="text-lg font-bold text-slate-400">UNRANKED</p>
                    <p className="text-sm text-slate-400">0 LP</p>
                    <div className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                      <span>0W 0L (0%)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Flex Queue */}
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <h3 className="mb-2 font-semibold text-blue-100">Ranked Flex</h3>
            <div className="h-32">
              {" "}
              {/* Added wrapper with fixed height for both states */}
              {flexQueue ? (
                <div className="flex h-full flex-row-reverse">
                  <div className="flex w-1/2 items-center justify-center">
                    <Image
                      src={`/rank_images/${flexQueue.tier}.png`}
                      alt={`${flexQueue.tier} Rank`}
                      className="object-contain"
                      width={150}
                      height={150}
                    />
                  </div>
                  <div className="flex w-1/2 flex-col justify-center">
                    <p className="text-lg font-bold truncate">{`${flexQueue.tier} ${flexQueue.rank}`}</p>
                    <p className="text-sm text-slate-400">{`${flexQueue.leaguePoints} LP`}</p>
                    <div className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                      <span className="text-green-400">{flexQueue.wins}W</span>
                      <span className="text-red-400">{flexQueue.losses}L</span>
                      <span className="text-slate-400">
                        (
                        {Math.round(
                          (flexQueue.wins /
                            (flexQueue.wins + flexQueue.losses)) *
                            100
                        )}
                        %)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center">
                  <div className="w-full">
                    <p className="text-lg font-bold text-slate-400">UNRANKED</p>
                    <p className="text-sm text-slate-400">0 LP</p>
                    <div className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                      <span>0W 0L (0%)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Match History Section */}
      <div className="grid grid-cols-5 gap-6">
        {/* Left Sidebar - Champion Stats */}
        <div className="col-span-1">
          <PlayerStats />
        </div>

        {/* Main Content - Match History */}
        <div className="col-span-4">
          <MatchHistory
            matches={data.matches}
            summonerPuuid={data.summoner.puuid}
            region={region}
          />
        </div>
      </div>
    </div>
  );
}
