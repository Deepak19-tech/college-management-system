import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { User } from "~backend/user/types";
import type { Course } from "~backend/course/types";

interface EnrollmentDialogProps {
  open: boolean;
  onClose: () => void;
  course: Course | null;
  students: User[];
}

export default function EnrollmentDialog({ open, onClose, course, students }: EnrollmentDialogProps) {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const enrollMutation = useMutation({
    mutationFn: backend.course.enroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast({ title: "Student enrolled successfully" });
      onClose();
      setSelectedStudentId("");
    },
    onError: (error) => {
      console.error("Enrollment error:", error);
      toast({ title: "Failed to enroll student", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!course || !selectedStudentId) return;

    enrollMutation.mutate({
      studentId: parseInt(selectedStudentId),
      courseId: course.id,
    });
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Enroll Student in {course.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">Select Student</Label>
            <Select
              value={selectedStudentId}
              onValueChange={setSelectedStudentId}
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

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={enrollMutation.isPending || !selectedStudentId}
            >
              {enrollMutation.isPending ? "Enrolling..." : "Enroll Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
