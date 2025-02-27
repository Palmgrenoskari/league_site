"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { ItemTooltip } from "./item-tooltip";
import { getItemData } from "@/lib/items";
import { DDRAGON_BASE_URL } from "@/lib/constants";

interface MatchHistoryProps {
  matches: any[];
  summonerPuuid: string;
  region: string;
}

// Some weird special cases, might need to append more cases later
function fixChampionName(name: string) {
  return name === "FiddleSticks" ? "Fiddlesticks" : name;
}

// Just changes "CLASSIC" to "Ranked" for now
function getDisplayGameMode(gameMode: string) {
  if (gameMode === "CLASSIC") return "Ranked";
  return gameMode;
}

export function MatchHistory({
  matches,
  summonerPuuid,
  region,
}: MatchHistoryProps) {
  const [expandedMatches, setExpandedMatches] = useState<string[]>([]);
  const [expandedPlayers, setExpandedPlayers] = useState<string[]>([]);
  const [itemData, setItemData] = useState<any>(null);

  useEffect(() => {
    // Fetch item data when component mounts
    const fetchItemData = async () => {
      const data = await getItemData();
      setItemData(data);
    };

    fetchItemData();
  }, []);

  const toggleMatch = (matchId: string) => {
    setExpandedMatches((current) =>
      current.includes(matchId)
        ? current.filter((id) => id !== matchId)
        : [...current, matchId]
    );
  };

  const togglePlayer = (playerId: string) => {
    setExpandedPlayers((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId]
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-blue-100">Match History</h2>
      <div className="space-y-4">
        {matches.map((match) => {
          const participant = match.info.participants.find(
            (p: any) => p.puuid === summonerPuuid
          );
          const win = participant.win;
          const gameType = getDisplayGameMode(match.info.gameMode);
          const duration = Math.floor(match.info.gameDuration / 60);
          const timeAgo = formatDistanceToNow(
            new Date(match.info.gameStartTimestamp),
            { addSuffix: true }
          );
          const isExpanded = expandedMatches.includes(match.metadata.matchId);

          // Split participants into teams
          const blueTeam = match.info.participants.filter(
            (p: any) => p.teamId === 100
          );
          const redTeam = match.info.participants.filter(
            (p: any) => p.teamId === 200
          );

          return (
            <div
              key={match.metadata.matchId}
              className={`rounded-lg border ${
                match.info.gameDuration < 300
                  ? "border-blue-500/20 bg-blue-500/5" // Remake styling
                  : win
                  ? "border-green-500/20 bg-green-500/5" // Victory styling
                  : "border-red-500/20 bg-red-500/5" // Defeat styling
              }`}
            >
              <button
                onClick={() => toggleMatch(match.metadata.matchId)}
                className="w-full text-left transition-colors hover:bg-slate-900/20"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-shrink-0">
                    <div className="relative h-16 w-16">
                      <Image
                        src={`${DDRAGON_BASE_URL}/img/champion/${fixChampionName(
                          participant.championName
                        )}.png`}
                        alt={participant.championName}
                        className="rounded-lg"
                        fill
                        sizes="64px"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg font-bold ${
                          match.info.gameDuration < 300
                            ? "text-blue-400" // Remake text color
                            : win
                            ? "text-green-400" // Victory text color
                            : "text-red-400" // Defeat text color
                        }`}
                      >
                        {match.info.gameDuration < 300
                          ? "Remake"
                          : win
                          ? "Victory"
                          : "Defeat"}
                      </span>
                      <span className="text-sm text-slate-400">{gameType}</span>
                    </div>
                    <div className="text-sm text-slate-400">{duration}m</div>
                    <div className="text-sm text-slate-400">{timeAgo}</div>
                  </div>

                  {/* Items list */}
                  <div className="flex flex-1 items-center gap-2 ml-4">
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: 6 }).map((_, i) => {
                        const itemId = participant[`item${i}`];
                        return itemId ? (
                          <ItemTooltip
                            key={i}
                            itemId={itemId}
                            itemData={itemData}
                          >
                            <div className="relative h-8 w-8">
                              <Image
                                src={`${DDRAGON_BASE_URL}/img/item/${itemId}.png`}
                                alt={`Item ${i + 1}`}
                                className="rounded"
                                fill
                                sizes="32px"
                              />
                            </div>
                          </ItemTooltip>
                        ) : (
                          <div
                            key={i}
                            className="h-8 w-8 rounded bg-slate-800"
                          />
                        );
                      })}
                      {/* Ward Item */}
                      {participant.item6 ? (
                        <ItemTooltip
                          itemId={participant.item6}
                          itemData={itemData}
                        >
                          <div className="relative h-8 w-8">
                            <Image
                              src={`${DDRAGON_BASE_URL}/img/item/${participant.item6}.png`}
                              alt="Ward Item"
                              className="rounded border border-yellow-500/30"
                              fill
                              sizes="32px"
                            />
                          </div>
                        </ItemTooltip>
                      ) : (
                        <div className="h-8 w-8 rounded bg-slate-800 border border-yellow-500/30" />
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      <div>
                        {participant.totalMinionsKilled +
                          participant.neutralMinionsKilled}{" "}
                        CS
                      </div>
                      <div>
                        {Math.round(participant.goldEarned / 1000)}k Gold
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {participant.kills}/{participant.deaths}/
                      {participant.assists}
                    </div>
                    <div className="text-sm text-slate-400">
                      {(
                        (participant.kills + participant.assists) /
                        Math.max(1, participant.deaths)
                      ).toFixed(2)}{" "}
                      KDA
                    </div>
                  </div>
                  <ChevronDown
                    className={`ml-4 h-5 w-5 text-slate-400 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              <div
                className={`grid overflow-hidden transition-all duration-200 ease-in-out ${
                  isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0">
                  <div className="border-t border-white/5 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Blue Team */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-blue-300">
                          Blue Team{" "}
                          {match.info.gameDuration < 300
                            ? "(Remake)"
                            : blueTeam[0].win
                            ? "(Victory)"
                            : "(Defeat)"}
                        </h3>
                        {blueTeam.map((player: any) => (
                          <PlayerRow
                            key={player.puuid}
                            player={player}
                            region={region}
                            isExpanded={expandedPlayers.includes(player.puuid)}
                            onToggle={() => togglePlayer(player.puuid)}
                            match={match}
                            itemData={itemData}
                          />
                        ))}
                      </div>

                      {/* Red Team */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-red-300">
                          Red Team{" "}
                          {match.info.gameDuration < 300
                            ? "(Remake)"
                            : redTeam[0].win
                            ? "(Victory)"
                            : "(Defeat)"}
                        </h3>
                        {redTeam.map((player: any) => (
                          <PlayerRow
                            key={player.puuid}
                            player={player}
                            region={region}
                            isExpanded={expandedPlayers.includes(player.puuid)}
                            onToggle={() => togglePlayer(player.puuid)}
                            match={match}
                            itemData={itemData}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface PlayerRowProps {
  player: any;
  region: string;
  isExpanded: boolean;
  onToggle: () => void;
  match: any;
  itemData: any;
}

function PlayerRow({
  player,
  region,
  isExpanded,
  onToggle,
  match,
  itemData,
}: PlayerRowProps) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded bg-slate-900/40 p-2">
        <div className="relative h-8 w-8">
          <Image
            src={`${DDRAGON_BASE_URL}/img/champion/${player.championName}.png`}
            alt={player.championName}
            className="rounded"
            fill
            sizes="32px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/player/${region}/${encodeURIComponent(
              player.riotIdGameName
            )}/${player.riotIdTagline}`}
            className="block truncate font-medium hover:text-blue-400"
          >
            {player.riotIdGameName}
            <span className="text-slate-400">#{player.riotIdTagline}</span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">
              {player.kills}/{player.deaths}/{player.assists}
            </span>
            <span className="text-slate-500">
              {(
                (player.kills + player.assists) /
                Math.max(1, player.deaths)
              ).toFixed(2)}{" "}
              KDA
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggle();
          }}
          className="p-1 hover:text-blue-400"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Stats & Items Dropdown */}
      <div
        className={`mt-1 overflow-hidden transition-all duration-200 ease-in-out ${
          isExpanded ? "max-h-40" : "max-h-0"
        }`}
      >
        <div className="rounded bg-slate-900/60 p-3 space-y-3">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-slate-400">
                {player.totalMinionsKilled + player.neutralMinionsKilled} CS
              </div>
              <div className="text-slate-500">
                {(
                  (player.totalMinionsKilled + player.neutralMinionsKilled) /
                  (match.info.gameDuration / 60)
                ).toFixed(1)}{" "}
                CS/min
              </div>
            </div>
            <div>
              <div className="text-slate-400">
                {Math.round(player.goldEarned / 1000)}k Gold
              </div>
              <div className="text-slate-500">
                {Math.round(player.goldEarned / (match.info.gameDuration / 60))}{" "}
                Gold/min
              </div>
            </div>
            <div>
              <div className="text-slate-400">
                {Math.round(player.totalDamageDealtToChampions / 1000)}k Damage
              </div>
              <div className="text-slate-500">
                {Math.round(
                  player.totalDamageDealtToChampions /
                    (match.info.gameDuration / 60)
                )}{" "}
                DMG/min
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div>
            <div className="text-xs text-slate-400 mb-1">Items</div>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: 6 }).map((_, i) => {
                const itemId = player[`item${i}`];
                return itemId ? (
                  <ItemTooltip key={i} itemId={itemId} itemData={itemData}>
                    <div className="relative h-8 w-8">
                      <Image
                        src={`${DDRAGON_BASE_URL}/img/item/${itemId}.png`}
                        alt={`Item ${i + 1}`}
                        className="rounded"
                        fill
                        sizes="32px"
                      />
                    </div>
                  </ItemTooltip>
                ) : (
                  <div key={i} className="h-8 w-8 rounded bg-slate-800" />
                );
              })}
              {/* Ward Item */}
              {player.item6 ? (
                <ItemTooltip itemId={player.item6} itemData={itemData}>
                  <div className="relative h-8 w-8">
                    <Image
                      src={`${DDRAGON_BASE_URL}/img/item/${player.item6}.png`}
                      alt="Ward Item"
                      className="rounded border border-yellow-500/30"
                      fill
                      sizes="32px"
                    />
                  </div>
                </ItemTooltip>
              ) : (
                <div className="h-8 w-8 rounded bg-slate-800 border border-yellow-500/30" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
