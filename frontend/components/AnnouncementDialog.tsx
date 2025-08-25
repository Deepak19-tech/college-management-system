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

interface AnnouncementDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AnnouncementDialog({ open, onClose }: AnnouncementDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetAudience: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) {
      setFormData({
        title: "",
        content: "",
        targetAudience: "",
      });
    }
  }, [open]);

  const createAnnouncementMutation = useMutation({
    mutationFn: backend.communication.createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast({ title: "Announcement created successfully" });
      onClose();
    },
    onError: (error) => {
      console.error("Create announcement error:", error);
      toast({ title: "Failed to create announcement", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createAnnouncementMutation.mutate({
      authorId: 1, // Mock author ID
      title: formData.title,
      content: formData.content,
      targetAudience: formData.targetAudience,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Announcement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Select
              value={formData.targetAudience}
              onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="students">Students Only</SelectItem>
                <SelectItem value="professors">Professors Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={5}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createAnnouncementMutation.isPending || !formData.targetAudience}
            >
              {createAnnouncementMutation.isPending ? "Creating..." : "Create Announcement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
