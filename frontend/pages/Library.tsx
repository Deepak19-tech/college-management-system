import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Book, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import backend from "~backend/client";
import BookDialog from "../components/BookDialog";
import BorrowDialog from "../components/BorrowDialog";
import ReturnDialog from "../components/ReturnDialog";

export default function Library() {
  const [searchTerm, setSearchTerm] = useState("");
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const { data: booksData, isLoading } = useQuery({
    queryKey: ["books", searchTerm],
    queryFn: () => backend.library.listBooks(searchTerm ? { search: searchTerm } : {}),
  });

  const { data: borrowingsData } = useQuery({
    queryKey: ["borrowings"],
    queryFn: () => backend.library.listBorrowings({}),
  });

  const { data: overdueData } = useQuery({
    queryKey: ["overdue-borrowings"],
    queryFn: () => backend.library.listBorrowings({ overdue: true }),
  });

  const { data: statsData } = useQuery({
    queryKey: ["library-stats"],
    queryFn: () => backend.library.getStats(),
  });

  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => backend.user.list({}),
  });

  const students = usersData?.users.filter(u => u.userType === "student") || [];

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student?.name || "Unknown Student";
  };

  const getBookTitle = (bookId: number) => {
    const book = booksData?.books.find(b => b.id === bookId);
    return book?.title || "Unknown Book";
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const isOverdue = (dueDate: Date) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Library</h1>
          <p className="mt-2 text-gray-600">Manage books, borrowings, and returns</p>
        </div>
        <Button onClick={() => setBookDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Book
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.totalBooks || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Borrowings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.activeBorrowings || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statsData?.overdueBorrowings || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${statsData?.totalFines?.toFixed(2) || "0.00"}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="books" className="space-y-6">
        <TabsList>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="borrowings">Borrowings</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading books...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {booksData?.books.map((book) => (
                <Card key={book.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{book.title}</CardTitle>
                        <p className="text-sm text-gray-600">by {book.author}</p>
                      </div>
                      <Badge variant={book.availableCopies > 0 ? "default" : "destructive"}>
                        {book.availableCopies > 0 ? "Available" : "Out of Stock"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm"><span className="font-medium">ISBN:</span> {book.isbn}</p>
                    {book.publisher && (
                      <p className="text-sm"><span className="font-medium">Publisher:</span> {book.publisher}</p>
                    )}
                    {book.category && (
                      <p className="text-sm"><span className="font-medium">Category:</span> {book.category}</p>
                    )}
                    <p className="text-sm">
                      <span className="font-medium">Copies:</span> {book.availableCopies}/{book.totalCopies}
                    </p>
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBook(book);
                          setBorrowDialogOpen(true);
                        }}
                        disabled={book.availableCopies === 0}
                      >
                        Borrow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="borrowings" className="space-y-6">
          <div className="space-y-4">
            {borrowingsData?.borrowings.filter(b => b.status === "borrowed").map((borrowing) => (
              <Card key={borrowing.id}>
                <CardContent className="flex justify-between items-center p-4">
                  <div>
                    <h3 className="font-medium">{getBookTitle(borrowing.bookId)}</h3>
                    <p className="text-sm text-gray-600">Borrowed by: {getStudentName(borrowing.studentId)}</p>
                    <p className="text-sm text-gray-600">
                      Due: {formatDate(borrowing.dueDate)}
                      {isOverdue(borrowing.dueDate) && (
                        <Badge variant="destructive" className="ml-2">Overdue</Badge>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBook(borrowing);
                      setReturnDialogOpen(true);
                    }}
                  >
                    Return
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-6">
          <div className="space-y-4">
            {overdueData?.borrowings.map((borrowing) => (
              <Card key={borrowing.id} className="border-red-200">
                <CardContent className="flex justify-between items-center p-4">
                  <div>
                    <h3 className="font-medium">{getBookTitle(borrowing.bookId)}</h3>
                    <p className="text-sm text-gray-600">Borrowed by: {getStudentName(borrowing.studentId)}</p>
                    <p className="text-sm text-red-600">
                      Overdue since: {formatDate(borrowing.dueDate)}
                    </p>
                    <p className="text-sm text-red-600">
                      Fine: ${borrowing.fineAmount.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBook(borrowing);
                      setReturnDialogOpen(true);
                    }}
                  >
                    Return
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <BookDialog
        open={bookDialogOpen}
        onClose={() => setBookDialogOpen(false)}
      />

      <BorrowDialog
        open={borrowDialogOpen}
        onClose={() => setBorrowDialogOpen(false)}
        book={selectedBook}
        students={students}
      />

      <ReturnDialog
        open={returnDialogOpen}
        onClose={() => setReturnDialogOpen(false)}
        borrowing={selectedBook}
      />
    </div>
  );
}
