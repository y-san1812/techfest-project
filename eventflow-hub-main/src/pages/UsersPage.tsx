import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  roles: Array<{ role: { name: string } }>;
}

interface Club {
  id: string;
  name: string;
}

interface Event {
  id: string;
  title: string;
}

interface Team {
  id: string;
  name: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function UsersPage() {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE}/admin/users?q=${searchQuery}`,
        axiosConfig
      );
      return response.data.items || response.data.data || [];
    },
  });

  const { data: allRoles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/admin/roles`, axiosConfig);
      return response.data;
    },
  });

  const { data: clubs = [] } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/admin/clubs`, axiosConfig);
      return response.data;
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events', selectedClub],
    queryFn: async () => {
      if (!selectedClub) return [];
      const response = await axios.get(`${API_BASE}/admin/clubs/${selectedClub}/events`, axiosConfig);
      return response.data;
    },
    enabled: !!selectedClub,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams', selectedEvent],
    queryFn: async () => {
      if (!selectedEvent) return [];
      const response = await axios.get(`${API_BASE}/admin/events/${selectedEvent}/teams`, axiosConfig);
      return response.data;
    },
    enabled: !!selectedEvent,
  });

  const setRolesMutation = useMutation({
    mutationFn: async (data: { userId: string; roles: string[]; clubId?: string; eventId?: string; teamId?: string }) => {
      await axios.patch(`${API_BASE}/admin/users/${data.userId}/roles`, {
        roles: data.roles,
        clubId: data.clubId,
        eventId: data.eventId,
        teamId: data.teamId,
      }, axiosConfig);
    },
    onSuccess: () => {
      refetch();
      setSelectedUser(null);
      setSelectedRoles([]);
      setSelectedClub('');
      setSelectedEvent('');
      setSelectedTeam('');
    },
  });

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles.map(r => typeof r === 'string' ? r : r.role.name));
    setSelectedClub('');
    setSelectedEvent('');
    setSelectedTeam('');
  };

  const handleRoleToggle = (roleName: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleName)
        ? prev.filter(r => r !== roleName)
        : [...prev, roleName]
    );
  };

  const handleSaveRoles = () => {
    if (!selectedUser) return;
    setRolesMutation.mutate({
      userId: selectedUser.id,
      roles: selectedRoles,
      clubId: selectedClub || undefined,
      eventId: selectedEvent || undefined,
      teamId: selectedTeam || undefined,
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-gray-600">Assign roles to users in your system</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Search and select users to manage roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No users found</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {Array.isArray(users) && users.length > 0 ? (
                    users.map((user: User) => (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                          selectedUser?.id === user.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {Array.isArray(user.roles) ? user.roles.map((r: any) => (
                            <Badge key={typeof r === 'string' ? r : r.role.name} variant="secondary" className="text-xs">
                              {typeof r === 'string' ? r : r.role.name}
                            </Badge>
                          )) : null}
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No users found</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {selectedUser ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assign Roles</CardTitle>
                  <CardDescription>{selectedUser.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {allRoles.map((role: any) => (
                      <label key={role.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role.name)}
                          onChange={() => handleRoleToggle(role.name)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm font-medium">{role.name}</span>
                        {role.description && (
                          <span className="text-xs text-gray-500">({role.description})</span>
                        )}
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Club Coordinator Selection */}
              {selectedRoles.includes('CLUB_COORDINATOR') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Select Club</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <select
                      value={selectedClub}
                      onChange={(e) => {
                        setSelectedClub(e.target.value);
                        setSelectedEvent('');
                        setSelectedTeam('');
                      }}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">-- Choose a Club --</option>
                      {clubs.map((club: Club) => (
                        <option key={club.id} value={club.id}>{club.name}</option>
                      ))}
                    </select>
                  </CardContent>
                </Card>
              )}

              {/* Faculty Coordinator Selection */}
              {selectedRoles.includes('FACULTY_COORDINATOR') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Select Event</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <select
                      value={selectedClub}
                      onChange={(e) => {
                        setSelectedClub(e.target.value);
                        setSelectedEvent('');
                      }}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">-- Choose a Club --</option>
                      {clubs.map((club: Club) => (
                        <option key={club.id} value={club.id}>{club.name}</option>
                      ))}
                    </select>
                    {selectedClub && (
                      <select
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="">-- Choose an Event --</option>
                        {events.map((event: Event) => (
                          <option key={event.id} value={event.id}>{event.title}</option>
                        ))}
                      </select>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Team Lead Selection */}
              {selectedRoles.includes('TEAM_LEAD') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Select Team</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <select
                      value={selectedClub}
                      onChange={(e) => {
                        setSelectedClub(e.target.value);
                        setSelectedEvent('');
                        setSelectedTeam('');
                      }}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">-- Choose a Club --</option>
                      {clubs.map((club: Club) => (
                        <option key={club.id} value={club.id}>{club.name}</option>
                      ))}
                    </select>
                    {selectedClub && (
                      <select
                        value={selectedEvent}
                        onChange={(e) => {
                          setSelectedEvent(e.target.value);
                          setSelectedTeam('');
                        }}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="">-- Choose an Event --</option>
                        {events.map((event: Event) => (
                          <option key={event.id} value={event.id}>{event.title}</option>
                        ))}
                      </select>
                    )}
                    {selectedEvent && (
                      <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="">-- Choose a Team --</option>
                        {teams.map((team: Team) => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveRoles}
                  disabled={setRolesMutation.isPending}
                  className="flex-1"
                >
                  {setRolesMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Roles'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedUser(null);
                    setSelectedRoles([]);
                    setSelectedClub('');
                    setSelectedEvent('');
                    setSelectedTeam('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <Card className="text-center py-8">
              <p className="text-gray-500">Select a user to assign roles</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
