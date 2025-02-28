"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const regions = [
  { value: "euw", label: "EUW" },
  { value: "eun", label: "EUN" },
  { value: "na", label: "NA" },
];

export default function Home() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(regions[0]);
  const [summonerName, setSummonerName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!summonerName || !tagLine) {
      setError("Please enter both summoner name and tag");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Navigate directly to the profile page with all parameters
      router.push(`/player/${selectedRegion.label}/${summonerName}/${tagLine}`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to find summoner"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-bold text-blue-100">
        Welcome to LoL Analytics
      </h1>

      <div className="w-full max-w-3xl space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 gap-3">
            <input
              type="text"
              className="flex h-10 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-base text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              placeholder="Summoner Name"
              value={summonerName}
              onChange={(e) => setSummonerName(e.target.value)}
            />
            <input
              type="text"
              className="flex h-10 w-28 rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-base text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              placeholder="Tag"
              maxLength={5}
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value)}
            />
          </div>

          <div className="relative">
            <button
              type="button"
              className="flex h-10 w-[110px] items-center justify-between rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-base text-slate-100 hover:bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              onClick={() => setIsOpen(!isOpen)}
            >
              {selectedRegion.label}
              <svg
                className={`h-4 w-4 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-[110px] rounded-md border border-white/10 bg-slate-900 py-1 shadow-lg">
                {regions.map((region) => (
                  <button
                    key={region.value}
                    className="flex w-full items-center px-3 py-2 text-left text-sm text-slate-100 hover:bg-slate-800"
                    onClick={() => {
                      setSelectedRegion(region);
                      setIsOpen(false);
                    }}
                  >
                    {region.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:pointer-events-none disabled:opacity-50"
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {isLoading ? "Searching..." : "Search Summoner"}
        </button>
      </div>
    </div>
  );
}
