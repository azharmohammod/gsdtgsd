import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Search, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Review, Member } from "@shared/schema";

type ReviewWithMember = Review & {
  member?: Member;
};

export default function AdminReviews() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const { toast } = useToast();

  // Fetch all reviews
  const { data: reviews = [], isLoading } = useQuery<ReviewWithMember[]>({
    queryKey: ["/api/admin/reviews"],
  });

  // Update review mutation
  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      return apiRequest("PUT", `/api/admin/reviews/${id}`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({
        title: variables.status === "approved" ? "อนุมัติรีวิวสำเร็จ" : "ปฏิเสธรีวิวสำเร็จ",
        description:
          variables.status === "approved"
            ? "รีวิวนี้จะแสดงในหน้าเว็บแล้ว"
            : "รีวิวนี้จะไม่แสดงในหน้าเว็บ",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทสถานะรีวิวได้",
        variant: "destructive",
      });
    },
  });

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.member?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || review.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    updateReviewMutation.mutate({ id, status: "approved" });
  };

  const handleReject = (id: string) => {
    updateReviewMutation.mutate({ id, status: "rejected" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">จัดการรีวิว</h1>
        <p className="text-muted-foreground">อนุมัติ หรือปฏิเสธรีวิวจากสมาชิก</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <CardTitle>รีวิวทั้งหมด</CardTitle>
              <CardDescription>ทั้งหมด {filteredReviews.length} รีวิว</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาด้วยชื่อผู้เขียน, เนื้อหา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-reviews"
            />
          </div>

          {/* Status Tabs */}
          <Tabs value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" data-testid="tab-all-reviews">
                ทั้งหมด
              </TabsTrigger>
              <TabsTrigger value="approved" data-testid="tab-approved-reviews">
                อนุมัติแล้ว
              </TabsTrigger>
              <TabsTrigger value="pending" data-testid="tab-pending-reviews">
                รอการอนุมัติ
              </TabsTrigger>
              <TabsTrigger value="rejected" data-testid="tab-rejected-reviews">
                ปฏิเสธ
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">ไม่พบรีวิว</div>
            ) : (
              filteredReviews.map((review) => (
                <Card
                  key={review.id}
                  className={review.status === "rejected" ? "opacity-60" : ""}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Review Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-white font-semibold">
                              {review.member?.name?.[0] || "?"}
                            </div>
                            <div>
                              <p className="font-semibold">{review.member?.name || "สมาชิก"}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString("th-TH", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge
                              variant={
                                review.status === "approved"
                                  ? "default"
                                  : review.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {review.status === "approved"
                                ? "อนุมัติแล้ว"
                                : review.status === "rejected"
                                ? "ปฏิเสธ"
                                : "รอการอนุมัติ"}
                            </Badge>
                          </div>
                          <h4 className="font-semibold">{review.title}</h4>
                          <p className="text-sm text-muted-foreground">{review.content}</p>

                          {(review.pros || review.cons) && (
                            <div className="grid sm:grid-cols-2 gap-4 pt-2">
                              {review.pros && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                    จุดเด่น:
                                  </p>
                                  <p className="text-sm">{review.pros}</p>
                                </div>
                              )}
                              {review.cons && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                    จุดที่ควรปรับปรุง:
                                  </p>
                                  <p className="text-sm">{review.cons}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 pt-2">
                              {review.images.map((image, idx) => (
                                <div
                                  key={idx}
                                  className="w-16 h-16 border rounded overflow-hidden"
                                >
                                  <img
                                    src={image}
                                    alt={`Review ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                            <span>เป็นประโยชน์: {review.helpful}</span>
                            <span>ไม่เป็นประโยชน์: {review.notHelpful}</span>
                          </div>
                        </div>

                        {review.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(review.id)}
                              disabled={updateReviewMutation.isPending}
                              data-testid={`button-reject-review-${review.id}`}
                            >
                              {updateReviewMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(review.id)}
                              disabled={updateReviewMutation.isPending}
                              data-testid={`button-approve-review-${review.id}`}
                            >
                              {updateReviewMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
