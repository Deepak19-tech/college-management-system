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
import type { Course } from "~backend/course/types";

interface GradeDialogProps {
  open: boolean;
  onClose: () => void;
  course: Course | null;
  students: User[];
}

export default function GradeDialog({ open, onClose, course, students }: GradeDialogProps) {
  const [formData, setFormData] = useState({
    studentId: "",
    grade: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateGradeMutation = useMutation({
    mutationFn: backend.course.updateGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast({ title: "Grade updated successfully" });
      onClose();
      setFormData({
        studentId: "",
        grade: "",
      });
    },
    onError: (error) => {
      console.error("Update grade error:", error);
      toast({ title: "Failed to update grade", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!course || !formData.studentId || !formData.grade) return;

    updateGradeMutation.mutate({
      studentId: parseInt(formData.studentId),
      courseId: course.id,
      grade: formData.grade,
    });
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Update Grade for {course.name}</DialogTitle>
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
            <Label htmlFor="grade">Grade</Label>
            <Select
              value={formData.grade}
              onValueChange={(value) => setFormData({ ...formData, grade: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="C+">C+</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="C-">C-</SelectItem>
                <SelectItem value="D+">D+</SelectItem>
                <SelectItem value="D">D</SelectItem>
                <SelectItem value="F">F</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateGradeMutation.isPending || !formData.studentId || !formData.grade}
            >
              {updateGradeMutation.isPending ? "Updating..." : "Update Grade"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
