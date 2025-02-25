import Database from "better-sqlite3";
import Link from "next/link";

interface Player {
  game_name: string;
  tag_line: string;
  league: string;
  rank: string;
  league_points: number;
  wins: number;
  losses: number;
}

async function getLeaderboards(
  page = 1
): Promise<{ players: Player[]; total: number }> {
  const db = new Database("league.db");
  const perPage = 200;
  const offset = (page - 1) * perPage;

  // Get total count
  const totalCount = db
    .prepare("SELECT COUNT(*) as count FROM leaderboards")
    .get() as { count: number };

  // Get paginated players
  const players = db
    .prepare(
      `
    SELECT game_name, tag_line, league, rank, league_points, wins, losses
    FROM leaderboards
    ORDER BY 
      CASE league
        WHEN 'CHALLENGER' THEN 1
        WHEN 'GRANDMASTER' THEN 2
        WHEN 'MASTER' THEN 3
        WHEN 'DIAMOND' THEN 4
        WHEN 'PLATINUM' THEN 5
        WHEN 'GOLD' THEN 6
        WHEN 'SILVER' THEN 7
        WHEN 'BRONZE' THEN 8
        WHEN 'IRON' THEN 9
      END,
      league_points DESC
    LIMIT ? OFFSET ?
  `
    )
    .all(perPage, offset) as Player[];

  db.close();
  return {
    players,
    total: totalCount.count,
  };
}

export default async function Leaderboards({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const { players, total } = await getLeaderboards(currentPage);
  const totalPages = Math.ceil(total / 200);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-100">Leaderboards</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-400">
            Showing {(currentPage - 1) * 200 + 1}-
            {Math.min(currentPage * 200, total)} of {total} players
          </span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/leaderboards?page=${currentPage - 1}`}
                className="rounded border border-white/10 bg-slate-900/60 px-3 py-1 hover:bg-slate-900"
              >
                Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/leaderboards?page=${currentPage + 1}`}
                className="rounded border border-white/10 bg-slate-900/60 px-3 py-1 hover:bg-slate-900"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/60">
              <th className="p-4 text-left font-medium text-slate-300">#</th>
              <th className="p-4 text-left font-medium text-slate-300">
                Player
              </th>
              <th className="p-4 text-left font-medium text-slate-300">Tier</th>
              <th className="p-4 text-left font-medium text-slate-300">LP</th>
              <th className="p-4 text-left font-medium text-slate-300">
                Win Rate
              </th>
              <th className="p-4 text-left font-medium text-slate-300">W/L</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => {
              const winRate = (
                (player.wins / (player.wins + player.losses)) *
                100
              ).toFixed(1);
              const globalRank = (currentPage - 1) * 200 + index + 1;

              return (
                <tr
                  key={`${player.game_name}#${player.tag_line}`}
                  className="border-b border-white/5 bg-slate-900/40 hover:bg-slate-900/60"
                >
                  <td className="p-4 text-slate-400">{globalRank}</td>
                  <td className="p-4">
                    <Link
                      href={`/player/euw/${player.game_name}/${player.tag_line}`}
                      className="block font-medium hover:text-blue-400"
                    >
                      {player.game_name}
                      <span className="text-slate-400">#{player.tag_line}</span>
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-slate-100">
                      {player.league}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-100">
                    {player.league_points}
                  </td>
                  <td className="p-4 text-slate-100">{winRate}%</td>
                  <td className="p-4">
                    <span className="text-green-400">{player.wins}W</span>{" "}
                    <span className="text-red-400">{player.losses}L</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-slate-400">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          {currentPage > 1 && (
            <Link
              href={`/leaderboards?page=${currentPage - 1}`}
              className="rounded border border-white/10 bg-slate-900/60 px-3 py-1 text-sm hover:bg-slate-900"
            >
              Previous
            </Link>
          )}
          {currentPage < totalPages && (
            <Link
              href={`/leaderboards?page=${currentPage + 1}`}
              className="rounded border border-white/10 bg-slate-900/60 px-3 py-1 text-sm hover:bg-slate-900"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
