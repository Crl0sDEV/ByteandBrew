interface Redemption {
    id: string;
    rewardId: string;       // Changed from reward_id
    redeemedAt: string | null;  // Changed from redeemed_at
    pointsUsed: number | null;  // Changed from points_used
    status: string;
  }
  
  interface RedemptionHistoryProps {
    redemptions: Redemption[];
  }
  
  export function RedemptionHistorySection({ redemptions }: RedemptionHistoryProps) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Redemption History</h2>
        {redemptions.length === 0 ? (
          <p>No redemptions yet.</p>
        ) : (
          <ul className="space-y-4">
            {redemptions.map((redemption) => (
              <li
                key={redemption.id}
                className="p-4 border rounded-md flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50"
              >
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-semibold">Redeemed at:</span>{" "}
                    {redemption.redeemedAt || "No date available"}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Points Used:</span>{" "}
                    {redemption.pointsUsed !== null ? redemption.pointsUsed : "No points recorded"}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      redemption.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {redemption.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }