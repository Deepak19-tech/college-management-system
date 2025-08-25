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
import type { Book } from "~backend/library/types";

interface BorrowDialogProps {
  open: boolean;
  onClose: () => void;
  book: Book | null;
  students: User[];
}

export default function BorrowDialog({ open, onClose, book, students }: BorrowDialogProps) {
  const [formData, setFormData] = useState({
    studentId: "",
    dueDate: "",
    notes: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const borrowBookMutation = useMutation({
    mutationFn: backend.library.borrowBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["borrowings"] });
      queryClient.invalidateQueries({ queryKey: ["library-stats"] });
      toast({ title: "Book borrowed successfully" });
      onClose();
      setFormData({
        studentId: "",
        dueDate: "",
        notes: "",
      });
    },
    onError: (error) => {
      console.error("Borrow book error:", error);
      toast({ title: "Failed to borrow book", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!book || !formData.studentId || !formData.dueDate) return;

    borrowBookMutation.mutate({
      bookId: book.id,
      studentId: parseInt(formData.studentId),
      dueDate: new Date(formData.dueDate),
      notes: formData.notes || undefined,
    });
  };

  if (!book) return null;

  // Set default due date to 2 weeks from now
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 14);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Borrow Book: {book.title}</DialogTitle>
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
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
            />
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
              disabled={borrowBookMutation.isPending || !formData.studentId || !formData.dueDate}
            >
              {borrowBookMutation.isPending ? "Borrowing..." : "Borrow Book"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
