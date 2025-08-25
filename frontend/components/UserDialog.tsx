import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { User, UserType } from "~backend/user/types";

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
}

export default function UserDialog({ open, onClose, user }: UserDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userType: "student" as UserType,
    studentId: "",
    department: "",
    phone: "",
    address: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        userType: user.userType,
        studentId: user.studentId || "",
        department: user.department || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        userType: "student",
        studentId: "",
        department: "",
        phone: "",
        address: "",
      });
    }
  }, [user, open]);

  const createUserMutation = useMutation({
    mutationFn: backend.user.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User created successfully" });
      onClose();
    },
    onError: (error) => {
      console.error("Create user error:", error);
      toast({ title: "Failed to create user", variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: backend.user.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User updated successfully" });
      onClose();
    },
    onError: (error) => {
      console.error("Update user error:", error);
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user) {
      updateUserMutation.mutate({
        id: user.id,
        name: formData.name,
        email: formData.email,
        department: formData.department || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
      });
    } else {
      createUserMutation.mutate({
        name: formData.name,
        email: formData.email,
        userType: formData.userType,
        studentId: formData.studentId || undefined,
        department: formData.department || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
      });
    }
  };

  const isLoading = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Create New User"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {!user && (
            <>
              <div className="space-y-2">
                <Label htmlFor="userType">User Type</Label>
                <Select
                  value={formData.userType}
                  onValueChange={(value: UserType) => setFormData({ ...formData, userType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.userType === "student" && (
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  />
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : user ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
