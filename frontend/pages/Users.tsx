import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { User, UserType } from "~backend/user/types";
import UserDialog from "../components/UserDialog";

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<UserType | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", selectedUserType],
    queryFn: () => backend.user.list(selectedUserType === "all" ? {} : { userType: selectedUserType }),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => backend.user.deleteUser({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User deleted successfully" });
    },
    onError: (error) => {
      console.error("Delete user error:", error);
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  const filteredUsers = usersData?.users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingUser(null);
  };

  const getUserTypeColor = (userType: UserType) => {
    switch (userType) {
      case "student": return "bg-blue-100 text-blue-800";
      case "professor": return "bg-green-100 text-green-800";
      case "admin": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-2 text-gray-600">Manage students, professors, and administrators</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedUserType}
          onChange={(e) => setSelectedUserType(e.target.value as UserType | "all")}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Users</option>
          <option value="student">Students</option>
          <option value="professor">Professors</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading users...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <Badge className={getUserTypeColor(user.userType)}>
                    {user.userType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {user.studentId && (
                  <p className="text-sm"><span className="font-medium">Student ID:</span> {user.studentId}</p>
                )}
                {user.department && (
                  <p className="text-sm"><span className="font-medium">Department:</span> {user.department}</p>
                )}
                {user.phone && (
                  <p className="text-sm"><span className="font-medium">Phone:</span> {user.phone}</p>
                )}
                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredUsers.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No users found matching your criteria.
        </div>
      )}

      <UserDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        user={editingUser}
      />
    </div>
  );
}
