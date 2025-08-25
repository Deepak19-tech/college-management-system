import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";

interface BookDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function BookDialog({ open, onClose }: BookDialogProps) {
  const [formData, setFormData] = useState({
    isbn: "",
    title: "",
    author: "",
    publisher: "",
    publicationYear: "",
    category: "",
    totalCopies: 1,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) {
      setFormData({
        isbn: "",
        title: "",
        author: "",
        publisher: "",
        publicationYear: "",
        category: "",
        totalCopies: 1,
      });
    }
  }, [open]);

  const createBookMutation = useMutation({
    mutationFn: backend.library.createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["library-stats"] });
      toast({ title: "Book added successfully" });
      onClose();
    },
    onError: (error) => {
      console.error("Create book error:", error);
      toast({ title: "Failed to add book", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createBookMutation.mutate({
      isbn: formData.isbn,
      title: formData.title,
      author: formData.author,
      publisher: formData.publisher || undefined,
      publicationYear: formData.publicationYear ? parseInt(formData.publicationYear) : undefined,
      category: formData.category || undefined,
      totalCopies: formData.totalCopies,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Book</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalCopies">Total Copies</Label>
              <Input
                id="totalCopies"
                type="number"
                min="1"
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="publisher">Publisher</Label>
            <Input
              id="publisher"
              value={formData.publisher}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="publicationYear">Publication Year</Label>
              <Input
                id="publicationYear"
                type="number"
                min="1800"
                max="2030"
                value={formData.publicationYear}
                onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBookMutation.isPending}>
              {createBookMutation.isPending ? "Adding..." : "Add Book"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
