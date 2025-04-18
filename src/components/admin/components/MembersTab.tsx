import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
  } from "@/components/ui/table";
  import { format } from "date-fns";
  import { Member } from "../types";
  import {
    Card as UICard,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
  } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import { useState, useMemo } from "react";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination";
  import { Button } from "@/components/ui/button";
  
  interface MembersTabProps {
    members: Member[];
    loading: boolean;
  }
  
  export function MembersTab({ members, loading }: MembersTabProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "with-card" | "without-card">("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
  
    const filteredMembers = useMemo(() => {
      return members.filter((member) => {
        const matchesSearch =
          member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase());
  
        const matchesCardStatus =
          statusFilter === "all" ||
          (statusFilter === "with-card" && member.card) ||
          (statusFilter === "without-card" && !member.card);
  
        return matchesSearch && matchesCardStatus;
      });
    }, [members, searchTerm, statusFilter]);
  
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const paginatedMembers = useMemo(() => {
      const start = (currentPage - 1) * itemsPerPage;
      return filteredMembers.slice(start, start + itemsPerPage);
    }, [filteredMembers, currentPage]);
  
    const handlePrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  
    if (loading) {
      return <div className="flex justify-center p-8">Loading members...</div>;
    }
  
    return (
      <UICard>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Member Management</CardTitle>
              <CardDescription>All registered loyalty program members</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 py-4">
            <Input
              placeholder="Filter by name or email..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Select
              value={statusFilter}
              onValueChange={(value: "all" | "with-card" | "without-card") => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Card Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="with-card">With Card</SelectItem>
                <SelectItem value="without-card">Without Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Card</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.full_name || "Anonymous"}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      {format(new Date(member.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {member.card?.uid || (
                        <span className="text-muted-foreground">No card</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {member.card?.points || 0}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No members match your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
  
          {/* Pagination */}
          {filteredMembers.length > itemsPerPage && (
            <Pagination className="mt-4 justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={handlePrevious}
                    aria-disabled={currentPage === 1}
                  />
                </PaginationItem>
  
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i + 1}>
                    <Button
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  </PaginationItem>
                ))}
  
                <PaginationItem>
                  <PaginationNext
                    onClick={handleNext}
                    aria-disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </UICard>
    );
  }
  