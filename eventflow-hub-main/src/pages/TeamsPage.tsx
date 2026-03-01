import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, UserPlus, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

interface Event {
  id: string;
  title: string;
}

interface Team {
  id: string;
  name: string;
  eventId: string;
  teamLeadId: string;
  teamLead: { id: string; name: string; email: string };
  members: Array<{ id: string; user: { id: string; name: string; email: string } }>;
  joinRequests: Array<{
    id: string;
    status: string;
    user: { id: string; name: string; email: string };
  }>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function TeamsPage() {
  const { token } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/events`, axiosConfig);
      return response.data;
    },
  });

  const { data: teams = [], isLoading: teamsLoading, refetch: refetchTeams } = useQuery({
    queryKey: ['teams', selectedEventId],
    queryFn: async () => {
      if (!selectedEventId) return [];
      const response = await axios.get(`${API_BASE}/teams/event/${selectedEventId}`, axiosConfig);
      return response.data;
    },
    enabled: !!selectedEventId,
  });

  const selectedTeam = useMemo(
    () => teams.find((t: Team) => t.id === selectedTeamId),
    [teams, selectedTeamId]
  );

  const joinTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      await axios.post(`${API_BASE}/teams/${teamId}/join`, {}, axiosConfig);
    },
    onSuccess: () => {
      refetchTeams();
      setShowJoinModal(false);
    },
  });

  const approveRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      await axios.post(`${API_BASE}/teams/requests/${requestId}/approve`, {}, axiosConfig);
    },
    onSuccess: () => {
      refetchTeams();
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      await axios.post(`${API_BASE}/teams/requests/${requestId}/reject`, {}, axiosConfig);
    },
    onSuccess: () => {
      refetchTeams();
    },
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Teams</h1>
        <p className="text-gray-600">View teams, manage join requests, and collaborate</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>Select an event to view teams</CardDescription>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <p className="text-center text-gray-500">No events available</p>
            ) : (
              <div className="space-y-2">
                {events.map((event: Event) => (
                  <button
                    key={event.id}
                    onClick={() => {
                      setSelectedEventId(event.id);
                      setSelectedTeamId('');
                    }}
                    className={`w-full text-left p-2 rounded-lg border transition-colors ${
                      selectedEventId === event.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{event.title}</div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teams List */}
        <div className="lg:col-span-2 space-y-6">
          {selectedEventId ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Teams
                  </CardTitle>
                  <CardDescription>Teams in this event</CardDescription>
                </CardHeader>
                <CardContent>
                  {teamsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : teams.length === 0 ? (
                    <p className="text-center text-gray-500">No teams in this event</p>
                  ) : (
                    <div className="space-y-2">
                      {teams.map((team: Team) => (
                        <button
                          key={team.id}
                          onClick={() => setSelectedTeamId(team.id)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                            selectedTeamId === team.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">{team.name}</div>
                          <div className="text-sm text-gray-600">
                            Lead: {team.teamLead.name}
                          </div>
                          <div className="flex gap-2 mt-1 items-center">
                            <Badge variant="outline" className="text-xs">
                              {team.members.length} members
                            </Badge>
                            {team.joinRequests.some(r => r.status === 'PENDING') && (
                              <Badge className="text-xs bg-amber-100 text-amber-800">
                                {team.joinRequests.filter(r => r.status === 'PENDING').length} pending requests
                              </Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Details */}
              {selectedTeam && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{selectedTeam.name}</CardTitle>
                          <CardDescription>Team Details</CardDescription>
                        </div>
                        <Button
                          onClick={() => setShowJoinModal(true)}
                          variant="outline"
                          size="sm"
                          className="gap-1"
                        >
                          <UserPlus className="w-4 h-4" />
                          Request to Join
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Team Lead</h3>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium">{selectedTeam.teamLead.name}</p>
                          <p className="text-sm text-gray-600">{selectedTeam.teamLead.email}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Members ({selectedTeam.members.length})</h3>
                        <div className="space-y-2">
                          {selectedTeam.members.length === 0 ? (
                            <p className="text-sm text-gray-500">No members yet</p>
                          ) : (
                            selectedTeam.members.map((member: any) => (
                              <div key={member.id} className="bg-gray-50 p-2 rounded-lg">
                                <p className="font-medium text-sm">{member.user.name}</p>
                                <p className="text-xs text-gray-600">{member.user.email}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Join Requests - Only visible to team leads and faculty */}
                      {selectedTeam.joinRequests.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Join Requests</h3>
                          <div className="space-y-2">
                            {selectedTeam.joinRequests.map((request: any) => (
                              <div key={request.id} className="flex items-center justify-between bg-amber-50 p-3 rounded-lg border border-amber-200">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{request.user.name}</p>
                                  <p className="text-xs text-gray-600">{request.user.email}</p>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {request.status}
                                  </Badge>
                                </div>
                                {request.status === 'PENDING' && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      onClick={() => approveRequestMutation.mutate(request.id)}
                                      disabled={approveRequestMutation.isPending}
                                      className="gap-1 bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => rejectRequestMutation.mutate(request.id)}
                                      disabled={rejectRequestMutation.isPending}
                                      className="gap-1"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <Card className="text-center py-12">
              <p className="text-gray-500">Select an event to view teams</p>
            </Card>
          )}
        </div>
      </div>

      {/* Join Team Modal */}
      {showJoinModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Request to Join Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                You're about to send a request to join <strong>{selectedTeam.name}</strong>. The team lead will review and approve or reject your request.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => joinTeamMutation.mutate(selectedTeam.id)}
                  disabled={joinTeamMutation.isPending}
                  className="flex-1"
                >
                  {joinTeamMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Request'
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowJoinModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
