import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { User } from "~backend/user/types";

interface WarningDialogProps {
  open: boolean;
  onClose: () => void;
  students: User[];
}

export default function WarningDialog({ open, onClose, students }: WarningDialogProps) {
  const [formData, setFormData] = useState({
    studentId: "",
    warningType: "",
    description: "",
    severity: "medium",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) {
      setFormData({
        studentId: "",
        warningType: "",
        description: "",
        severity: "medium",
      });
    }
  }, [open]);

  const createWarningMutation = useMutation({
    mutationFn: backend.communication.createWarning,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warnings"] });
      toast({ title: "Warning issued successfully" });
      onClose();
    },
    onError: (error) => {
      console.error("Create warning error:", error);
      toast({ title: "Failed to issue warning", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createWarningMutation.mutate({
      issuedBy: 1, // Mock issuer ID
      studentId: parseInt(formData.studentId),
      warningType: formData.warningType,
      description: formData.description,
      severity: formData.severity,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Issue Warning</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">Student</Label>
            <Select
              value={formData.studentId}
              onValueChange={(value) => setFormData({ ...formData, studentId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.name} ({student.studentId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="warningType">Warning Type</Label>
            <Select
              value={formData.warningType}
              onValueChange={(value) => setFormData({ ...formData, warningType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select warning type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Attendance">Attendance</SelectItem>
                <SelectItem value="Academic Performance">Academic Performance</SelectItem>
                <SelectItem value="Behavior">Behavior</SelectItem>
                <SelectItem value="Library Fine">Library Fine</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity</Label>
            <Select
              value={formData.severity}
              onValueChange={(value) => setFormData({ ...formData, severity: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createWarningMutation.isPending || !formData.studentId || !formData.warningType}
            >
              {createWarningMutation.isPending ? "Issuing..." : "Issue Warning"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
