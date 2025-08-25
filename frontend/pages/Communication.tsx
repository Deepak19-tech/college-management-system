import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, MessageSquare, Megaphone, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import backend from "~backend/client";
import MessageDialog from "../components/MessageDialog";
import AnnouncementDialog from "../components/AnnouncementDialog";
import WarningDialog from "../components/WarningDialog";

export default function Communication() {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);

  const { data: messagesData } = useQuery({
    queryKey: ["messages"],
    queryFn: () => backend.communication.listMessages({ userId: 1 }), // Mock user ID
  });

  const { data: announcementsData } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => backend.communication.listAnnouncements({ isActive: true }),
  });

  const { data: warningsData } = useQuery({
    queryKey: ["warnings"],
    queryFn: () => backend.communication.listWarnings({ isResolved: false }),
  });

  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => backend.user.list({}),
  });

  const users = usersData?.users || [];
  const students = users.filter(u => u.userType === "student");

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user?.name || "Unknown User";
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication</h1>
          <p className="mt-2 text-gray-600">Messages, announcements, and warnings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setMessageDialogOpen(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Message
          </Button>
          <Button onClick={() => setAnnouncementDialogOpen(true)}>
            <Megaphone className="h-4 w-4 mr-2" />
            Create Announcement
          </Button>
          <Button onClick={() => setWarningDialogOpen(true)} variant="outline">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Issue Warning
          </Button>
        </div>
      </div>

      <Tabs defaultValue="messages" className="space-y-6">
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="warnings">Warnings</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          {messagesData?.messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No messages found
            </div>
          ) : (
            <div className="space-y-4">
              {messagesData?.messages.map((message) => (
                <Card key={message.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{message.subject}</CardTitle>
                        <p className="text-sm text-gray-600">
                          From: {getUserName(message.senderId)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!message.isRead && (
                          <Badge variant="default">Unread</Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{message.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          {announcementsData?.announcements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No announcements found
            </div>
          ) : (
            <div className="space-y-4">
              {announcementsData?.announcements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        <p className="text-sm text-gray-600">
                          By: {getUserName(announcement.authorId)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {announcement.targetAudience}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(announcement.createdAt)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{announcement.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="warnings" className="space-y-4">
          {warningsData?.warnings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active warnings
            </div>
          ) : (
            <div className="space-y-4">
              {warningsData?.warnings.map((warning) => (
                <Card key={warning.id} className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{warning.warningType}</CardTitle>
                        <p className="text-sm text-gray-600">
                          Student: {getUserName(warning.studentId)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Issued by: {getUserName(warning.issuedBy)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(warning.severity)}>
                          {warning.severity}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(warning.createdAt)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{warning.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <MessageDialog
        open={messageDialogOpen}
        onClose={() => setMessageDialogOpen(false)}
        users={users}
      />

      <AnnouncementDialog
        open={announcementDialogOpen}
        onClose={() => setAnnouncementDialogOpen(false)}
      />

      <WarningDialog
        open={warningDialogOpen}
        onClose={() => setWarningDialogOpen(false)}
        students={students}
      />
    </div>
  );
}
