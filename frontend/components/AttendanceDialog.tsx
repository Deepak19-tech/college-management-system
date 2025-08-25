import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { User } from "~backend/user/types";
import type { Course, AttendanceStatus } from "~backend/course/types";

interface AttendanceDialogProps {
  open: boolean;
  onClose: () => void;
  course: Course | null;
  students: User[];
}

export default function AttendanceDialog({ open, onClose, course, students }: AttendanceDialogProps) {
  const [formData, setFormData] = useState({
    studentId: "",
    date: new Date().toISOString().split('T')[0],
    status: "present" as AttendanceStatus,
    notes: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markAttendanceMutation = useMutation({
    mutationFn: backend.course.markAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({ title: "Attendance marked successfully" });
      onClose();
      setFormData({
        studentId: "",
        date: new Date().toISOString().split('T')[0],
        status: "present",
        notes: "",
      });
    },
    onError: (error) => {
      console.error("Mark attendance error:", error);
      toast({ title: "Failed to mark attendance", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!course || !formData.studentId) return;

    markAttendanceMutation.mutate({
      studentId: parseInt(formData.studentId),
      courseId: course.id,
      date: new Date(formData.date),
      status: formData.status,
      notes: formData.notes || undefined,
    });
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Mark Attendance for {course.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">Select Student</Label>
            <Select
              value={formData.studentId}
              onValueChange={(value) => setFormData({ ...formData, studentId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a student" />
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
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: AttendanceStatus) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={markAttendanceMutation.isPending || !formData.studentId}
            >
              {markAttendanceMutation.isPending ? "Marking..." : "Mark Attendance"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
