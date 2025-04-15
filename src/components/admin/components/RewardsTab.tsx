import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Reward } from "../types";
import { Card as UICard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { RewardForm } from "./RewardForm";
import { deleteRewardImage, uploadRewardImage } from "@/lib/uploadImage";

interface RewardsTabProps {
  rewards: Reward[];
  loading: boolean;
  onCreate: (reward: Omit<Reward, 'id' | 'created_at'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Reward>) => Promise<void>;
  onDelete: (id: string, image_url: string | null) => Promise<void>;
}

export function RewardsTab({ rewards, loading, onCreate, onUpdate, onDelete }: RewardsTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  if (loading) {
    return <div className="flex justify-center p-8">Loading rewards...</div>;
  }

  return (
    <div className="space-y-4">
      <UICard>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Rewards Management</CardTitle>
              <CardDescription>Available rewards for redemption</CardDescription>
            </div>
            <Button 
              className="flex items-center gap-2"
              onClick={() => {
                setEditingReward(null);
                setIsFormOpen(true);
              }}
            >
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
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingReward(reward);
                            setIsFormOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this reward?')) {
                              onDelete(reward.id, reward.image_url);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
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

      <RewardForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        reward={editingReward}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onUploadImage={uploadRewardImage}  // From useRewards hook
  onDeleteImage={deleteRewardImage}
      />
    </div>
  );
}