import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

interface Club {
  id: string;
  name: string;
  createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function ClubsPage() {
  const { token } = useAuth();
  const [clubName, setClubName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const { data: clubs = [], isLoading, refetch } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/clubs`, axiosConfig);
      return response.data || [];
    },
  });

  const createClubMutation = useMutation({
    mutationFn: async (name: string) => {
      await axios.post(`${API_BASE}/clubs`, { name }, axiosConfig);
    },
    onSuccess: () => {
      setClubName('');
      refetch();
      toast.success('Club created successfully');
    },
    onError: () => {
      toast.error('Failed to create club');
    },
  });

  const handleCreateClub = async () => {
    if (!clubName.trim()) {
      toast.error('Please enter a club name');
      return;
    }
    createClubMutation.mutate(clubName);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Clubs Management</h1>
        <p className="text-gray-600">Manage and organize clubs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create New Club</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Club name"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
              />
              <Button
                onClick={handleCreateClub}
                disabled={createClubMutation.isPending}
                className="w-full"
              >
                {createClubMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Club
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Clubs</CardTitle>
              <CardDescription>View and manage all clubs</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : clubs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No clubs found</p>
              ) : (
                <div className="space-y-3">
                  {clubs.map((club: Club) => (
                    <div
                      key={club.id}
                      className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50"
                    >
                      <div>
                        <h3 className="font-medium">{club.name}</h3>
                        <p className="text-xs text-gray-500">
                          {new Date(club.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
