import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { BookBorrowing } from "~backend/library/types";

interface ReturnDialogProps {
  open: boolean;
  onClose: () => void;
  borrowing: BookBorrowing | null;
}

export default function ReturnDialog({ open, onClose, borrowing }: ReturnDialogProps) {
  const [formData, setFormData] = useState({
    returnDate: new Date().toISOString().split('T')[0],
    notes: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const returnBookMutation = useMutation({
    mutationFn: backend.library.returnBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["borrowings"] });
      queryClient.invalidateQueries({ queryKey: ["overdue-borrowings"] });
      queryClient.invalidateQueries({ queryKey: ["library-stats"] });
      toast({ title: "Book returned successfully" });
      onClose();
      setFormData({
        returnDate: new Date().toISOString().split('T')[0],
        notes: "",
      });
    },
    onError: (error) => {
      console.error("Return book error:", error);
      toast({ title: "Failed to return book", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!borrowing) return;

    returnBookMutation.mutate({
      borrowingId: borrowing.id,
      returnDate: new Date(formData.returnDate),
      notes: formData.notes || undefined,
    });
  };

  if (!borrowing) return null;

  // Calculate potential fine
  const dueDate = new Date(borrowing.dueDate);
  const returnDate = new Date(formData.returnDate);
  const daysDiff = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  const potentialFine = daysDiff > 0 ? daysDiff * 1.0 : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Return Book</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="returnDate">Return Date</Label>
            <Input
              id="returnDate"
              type="date"
              value={formData.returnDate}
              onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {potentialFine > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <span className="font-medium">Late Fee:</span> ${potentialFine.toFixed(2)}
              </p>
              <p className="text-xs text-red-600 mt-1">
                Book was due on {dueDate.toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Condition notes, damage, etc..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={returnBookMutation.isPending}
            >
              {returnBookMutation.isPending ? "Processing..." : "Return Book"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
