import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { Member } from "../types";
import { Card as UICard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface MembersTabProps {
  members: Member[];
  loading: boolean;
}

export function MembersTab({ members, loading }: MembersTabProps) {
  if (loading) {
    return <div className="flex justify-center p-8">Loading members...</div>;
  }

  return (
    <UICard>
      <CardHeader>
        <CardTitle>Member Management</CardTitle>
        <CardDescription>All registered loyalty program members</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center py-4">
          <Input placeholder="Filter members..." className="max-w-sm" />
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
            {members.length > 0 ? (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.full_name || 'Anonymous'}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    {format(new Date(member.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {member.card?.uid || 'No card'}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.card?.points || 0}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </UICard>
  );
}