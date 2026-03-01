import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

interface Club {
  id: string;
  name: string;
  description?: string;
  coordinator?: string;
  membersCount?: number;
  status?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function ClubsPage() {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const { data: clubs = [], isLoading, refetch } = useQuery({
    queryKey: ['clubs', searchQuery],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE}/clubs?q=${searchQuery}`,
        axiosConfig
      );
      return response.data.items ?? response.data ?? [];
    },
  });

  const deleteClubMutation = useMutation({
    mutationFn: async (clubId: string) => {
      await axios.delete(`${API_BASE}/clubs/${clubId}`, axiosConfig);
    },
    onSuccess: () => {
      refetch();
      setSelectedClub(null);
    },
  });

  const handleDeleteClub = (clubId: string) => {
    if (confirm('Are you sure you want to delete this club?')) {
      deleteClubMutation.mutate(clubId);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Clubs Management</h1>
          <p className="text-gray-600">Manage clubs and their coordinators</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Club
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Clubs</CardTitle>
              <CardDescription>Search and select clubs to manage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search clubs by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : clubs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No clubs found</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {clubs.map((club: Club) => (
                    <button
                      key={club.id}
                      onClick={() => setSelectedClub(club)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        selectedClub?.id === club.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{club.name}</div>
                      {club.description && (
                        <div className="text-sm text-gray-600">{club.description}</div>
                      )}
                      <div className="flex gap-2 mt-1 flex-wrap items-center">
                        {club.coordinator && (
                          <Badge variant="outline">{club.coordinator}</Badge>
                        )}
                        {club.membersCount && (
                          <span className="text-xs text-gray-500">
                            {club.membersCount} members
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedClub ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Club Details</CardTitle>
                <CardDescription>{selectedClub.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedClub.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Description</p>
                    <p className="text-sm text-gray-600">{selectedClub.description}</p>
                  </div>
                )}

                {selectedClub.coordinator && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Coordinator</p>
                    <p className="text-sm text-gray-600">{selectedClub.coordinator}</p>
                  </div>
                )}

                {selectedClub.membersCount !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Members</p>
                    <p className="text-sm text-gray-600">{selectedClub.membersCount}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteClub(selectedClub.id)}
                    disabled={deleteClubMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {deleteClubMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center py-8">
              <p className="text-gray-500">Select a club to view details</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
