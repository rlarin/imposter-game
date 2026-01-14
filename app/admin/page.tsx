'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface RoomMetrics {
  roomCode: string;
  hostName: string;
  playerCount: number;
  connectedPlayers: number;
  phase: string;
  createdAt: number;
  lastHeartbeat: number;
}

interface DailyUsageData {
  date: string;
  roomsCreated: number;
  activeUsers: number;
}

interface AdminStats {
  totalRooms: number;
  totalPlayers: number;
  totalRoomsCreated: number;
  totalLikes: number;
  rooms: RoomMetrics[];
  usageHistory: DailyUsageData[];
}

const REFRESH_INTERVAL = 10000; // 10 seconds

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/stats');

      if (response.status === 401) {
        // Browser will show login prompt automatically
        setError('Authentication required');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data: AdminStats = await response.json();
      setStats(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    const interval = setInterval(fetchStats, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatPhase = (phase: string): string => {
    const phases: Record<string, string> = {
      lobby: 'Lobby',
      'word-reveal': 'Word Reveal',
      'clue-round': 'Clue Round',
      'round-end': 'Round End',
      voting: 'Voting',
      'vote-results': 'Vote Results',
      'imposter-guess': 'Imposter Guess',
      'game-over': 'Game Over',
    };
    return phases[phase] || phase;
  };

  const getPhaseColor = (phase: string): string => {
    const colors: Record<string, string> = {
      lobby: 'bg-gray-100 text-gray-700',
      'word-reveal': 'bg-blue-100 text-blue-700',
      'clue-round': 'bg-yellow-100 text-yellow-700',
      'round-end': 'bg-orange-100 text-orange-700',
      voting: 'bg-purple-100 text-purple-700',
      'vote-results': 'bg-pink-100 text-pink-700',
      'imposter-guess': 'bg-red-100 text-red-700',
      'game-over': 'bg-green-100 text-green-700',
    };
    return colors[phase] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-gray-600">Loading...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchStats();
            }}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">El Impostor Game Stats</p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card className="text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Active Rooms</p>
            <p className="text-4xl font-bold text-indigo-600 mt-2">{stats?.totalRooms || 0}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Total Players</p>
            <p className="text-4xl font-bold text-purple-600 mt-2">{stats?.totalPlayers || 0}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Rooms Created</p>
            <p className="text-4xl font-bold text-pink-600 mt-2">{stats?.totalRoomsCreated || 0}</p>
          </Card>
          <Card className="text-center col-span-2 sm:col-span-1">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Total Likes</p>
            <p className="text-4xl font-bold text-red-600 mt-2">❤️ {stats?.totalLikes || 0}</p>
          </Card>
        </div>

        {/* Usage Chart */}
        {stats?.usageHistory && stats.usageHistory.length > 0 && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Usage History (Last 30 Days)</h2>
            <div className="space-y-6">
              {/* Chart.js Bar Chart */}
              <div className="h-64 sm:h-80">
                <Bar
                  data={{
                    labels: stats.usageHistory.map((d) =>
                      new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    ),
                    datasets: [
                      {
                        label: 'Rooms Created',
                        data: stats.usageHistory.map((d) => d.roomsCreated),
                        backgroundColor: 'rgba(99, 102, 241, 0.8)',
                        borderColor: 'rgb(99, 102, 241)',
                        borderWidth: 1,
                        borderRadius: 4,
                      },
                      {
                        label: 'Active Users',
                        data: stats.usageHistory.map((d) => d.activeUsers),
                        backgroundColor: 'rgba(34, 197, 94, 0.8)',
                        borderColor: 'rgb(34, 197, 94)',
                        borderWidth: 1,
                        borderRadius: 4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                        },
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8,
                      },
                    },
                    scales: {
                      x: {
                        grid: {
                          display: false,
                        },
                        ticks: {
                          maxRotation: 45,
                          minRotation: 45,
                          font: {
                            size: 10,
                          },
                        },
                      },
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)',
                        },
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                    interaction: {
                      mode: 'nearest',
                      axis: 'x',
                      intersect: false,
                    },
                  }}
                />
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">
                    {stats.usageHistory.reduce((sum, d) => sum + d.roomsCreated, 0)}
                  </p>
                  <p className="text-xs text-gray-500">Total Rooms (30 days)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {stats.usageHistory.reduce((sum, d) => sum + d.activeUsers, 0)}
                  </p>
                  <p className="text-xs text-gray-500">Total Users (30 days)</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Rooms List */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Rooms</h2>
          {stats?.rooms && stats.rooms.length > 0 ? (
            <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
              {stats.rooms.map((room) => (
                <div
                  key={room.roomCode}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg flex-shrink-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-lg font-bold text-indigo-600">
                      {room.roomCode}
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getPhaseColor(room.phase)}`}
                    >
                      {formatPhase(room.phase)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700">
                      {room.connectedPlayers}/{room.playerCount} players
                    </div>
                    <div className="text-xs text-gray-400">Host: {room.hostName}</div>
                    <div className="text-xs text-gray-400">
                      Created: {formatTime(room.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No active rooms at the moment</p>
          )}
        </Card>

        {/* Footer */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-white/60 text-sm">Auto-refreshes every 10 seconds</p>
          <a
            href="https://www.buymeacoffee.com/rlarin"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-60 hover:opacity-100 transition-opacity"
          >
            <img
              src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=rlarin&button_colour=FFDD00&font_colour=000000&font_family=Inter&outline_colour=000000&coffee_colour=ffffff"
              alt="Buy me a coffee"
              className="h-8"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
