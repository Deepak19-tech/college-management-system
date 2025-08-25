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

interface CourseDialogProps {
  open: boolean;
  onClose: () => void;
  professors: User[];
}

export default function CourseDialog({ open, onClose, professors }: CourseDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    credits: 3,
    department: "",
    professorId: "",
    semester: "",
    year: new Date().getFullYear(),
    maxStudents: 50,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) {
      setFormData({
        code: "",
        name: "",
        description: "",
        credits: 3,
        department: "",
        professorId: "",
        semester: "",
        year: new Date().getFullYear(),
        maxStudents: 50,
      });
    }
  }, [open]);

  const createCourseMutation = useMutation({
    mutationFn: backend.course.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Course created successfully" });
      onClose();
    },
    onError: (error) => {
      console.error("Create course error:", error);
      toast({ title: "Failed to create course", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createCourseMutation.mutate({
      code: formData.code,
      name: formData.name,
      description: formData.description || undefined,
      credits: formData.credits,
      department: formData.department,
      professorId: formData.professorId ? parseInt(formData.professorId) : undefined,
      semester: formData.semester,
      year: formData.year,
      maxStudents: formData.maxStudents,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Course Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                min="1"
                max="6"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Course Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="professor">Professor</Label>
            <Select
              value={formData.professorId}
              onValueChange={(value) => setFormData({ ...formData, professorId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a professor" />
              </SelectTrigger>
              <SelectContent>
                {professors.map((professor) => (
                  <SelectItem key={professor.id} value={professor.id.toString()}>
                    {professor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select
                value={formData.semester}
                onValueChange={(value) => setFormData({ ...formData, semester: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fall">Fall</SelectItem>
                  <SelectItem value="Spring">Spring</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min="2020"
                max="2030"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxStudents">Maximum Students</Label>
            <Input
              id="maxStudents"
              type="number"
              min="1"
              max="200"
              value={formData.maxStudents}
              onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCourseMutation.isPending}>
              {createCourseMutation.isPending ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
