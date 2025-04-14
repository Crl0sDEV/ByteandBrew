import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Reward } from "../types";
import { Card as UICard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface RewardsTabProps {
  rewards: Reward[];
  loading: boolean;
}

export function RewardsTab({ rewards, loading }: RewardsTabProps) {
  if (loading) {
    return <div className="flex justify-center p-8">Loading rewards...</div>;
  }

  return (
    <UICard>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Rewards Management</CardTitle>
            <CardDescription>Available rewards for redemption</CardDescription>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Reward
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reward</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Points Required</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewards.length > 0 ? (
              rewards.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell className="font-medium">{reward.name}</TableCell>
                  <TableCell>{reward.description}</TableCell>
                  <TableCell>{reward.points_required}</TableCell>
                  <TableCell>
                    <Badge variant={reward.is_active ? 'default' : 'outline'}>
                      {reward.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No rewards found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </UICard>
  );
}