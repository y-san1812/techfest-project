import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  roles: Array<{ role: { name: string } }>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function UsersPage() {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE}/admin/users?q=${searchQuery}`,
        axiosConfig
      );
      return response.data.data;
    },
  });

  const { data: allRoles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/admin/roles`, axiosConfig);
      return response.data;
    },
  });

  const setRolesMutation = useMutation({
    mutationFn: async (data: { userId: string; roles: number[] }) => {
      await axios.patch(`${API_BASE}/admin/users/${data.userId}/roles`, { roles: data.roles }, axiosConfig);
    },
    onSuccess: () => {
      refetch();
      setSelectedUser(null);
      setSelectedRoles([]);
    },
  });

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles.map(r => r.role.name));
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId)
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSaveRoles = () => {
    if (!selectedUser) return;
    const roleIds = allRoles
      .filter((role: any) => selectedRoles.includes(role.name))
      .map((role: any) => role.id);
    setRolesMutation.mutate({ userId: selectedUser.id, roles: roleIds });
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
                  {users.map((user: User) => (
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
                        {user.roles.map((r: any) => (
                          <Badge key={r.role.name} variant="secondary" className="text-xs">
                            {r.role.name}
                          </Badge>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedUser ? (
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
                      <span className="text-sm">{role.name}</span>
                      {role.description && (
                        <span className="text-xs text-gray-500">({role.description})</span>
                      )}
                    </label>
                  ))}
                </div>

                <div className="flex gap-2 pt-4">
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
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
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
