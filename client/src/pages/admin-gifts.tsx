import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Truck,
  Calendar,
  User,
  Phone,
  MapPin,
  ExternalLink,
  Save,
  Search,
  Loader2,
  Gift,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { GiftDelivery, Member, Gift as GiftType } from "@shared/schema";
import AdminGiftsCatalog from "./admin-gifts-catalog";

type DeliveryWithDetails = GiftDelivery & {
  member?: Member;
  gift?: GiftType;
};

export default function AdminGifts() {
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryWithDetails | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "sent">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTracking, setEditingTracking] = useState({
    trackingNumber: "",
    trackingUrl: "",
    status: "pending",
  });
  const { toast } = useToast();

  // Fetch all gift deliveries
  const { data: deliveries = [], isLoading } = useQuery<DeliveryWithDetails[]>({
    queryKey: ["/api/admin/gift-deliveries"],
  });

  // Update delivery mutation
  const updateDeliveryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GiftDelivery> }) => {
      return apiRequest("PUT", `/api/admin/gift-deliveries/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gift-deliveries"] });
      toast({
        title: "อัพเดทสถานะการจัดส่งสำเร็จ",
        description: "บันทึกข้อมูลการจัดส่งเรียบร้อยแล้ว",
      });
      setSelectedDelivery(null);
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทข้อมูลการจัดส่งได้",
        variant: "destructive",
      });
    },
  });

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesStatus = filterStatus === "all" || delivery.status === filterStatus;
    const matchesSearch =
      delivery.deliveryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.deliveryPhone?.includes(searchTerm) ||
      delivery.member?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenDialog = (delivery: DeliveryWithDetails) => {
    setSelectedDelivery(delivery);
    setEditingTracking({
      trackingNumber: delivery.trackingNumber || "",
      trackingUrl: delivery.trackingUrl || "",
      status: delivery.status,
    });
  };

  const handleSaveTracking = () => {
    if (!selectedDelivery) return;

    updateDeliveryMutation.mutate({
      id: selectedDelivery.id,
      data: editingTracking,
    });
  };

  const pendingCount = deliveries.filter((d) => d.status === "pending").length;
  const sentCount = deliveries.filter((d) => d.status === "sent").length;

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
        <h1 className="text-3xl font-bold">จัดการของขวัญ</h1>
        <p className="text-muted-foreground mt-2">
          จัดการรายการของขวัญและการจัดส่ง
        </p>
      </div>

      <Tabs defaultValue="catalog" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="catalog" data-testid="tab-catalog">
            <Gift className="h-4 w-4 mr-2" />
            รายการของขวัญ
          </TabsTrigger>
          <TabsTrigger value="deliveries" data-testid="tab-deliveries">
            <Truck className="h-4 w-4 mr-2" />
            การจัดส่ง
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          <AdminGiftsCatalog />
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-6">

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{deliveries.length}</div>
            <p className="text-xs text-muted-foreground mt-1">คำขอจัดส่ง</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รอจัดส่ง</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">รายการที่ต้องจัดส่ง</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              จัดส่งแล้ว
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{sentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">รายการที่จัดส่งแล้ว</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>ค้นหาและกรอง</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาชื่อ, เบอร์โทร..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-gifts"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-filter-status">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="pending">รอจัดส่ง</SelectItem>
                <SelectItem value="sent">จัดส่งแล้ว</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries List */}
      <div className="space-y-4">
        {filteredDeliveries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">ไม่พบรายการจัดส่ง</p>
            </CardContent>
          </Card>
        ) : (
          filteredDeliveries.map((delivery) => (
            <Card key={delivery.id}>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-[1fr_auto] gap-6">
                  {/* Delivery Details */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {delivery.gift?.name || "ของขวัญ"}
                          </h3>
                          <Badge
                            variant={delivery.status === "sent" ? "default" : "secondary"}
                            className={
                              delivery.status === "sent"
                                ? "bg-green-600"
                                : "bg-orange-600 text-white"
                            }
                          >
                            {delivery.status === "sent" ? "จัดส่งแล้ว" : "รอจัดส่ง"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          คำขอวันที่{" "}
                          {new Date(delivery.createdAt).toLocaleDateString("th-TH")}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">ชื่อผู้รับ</p>
                            <p className="text-sm font-medium">{delivery.deliveryName}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">เบอร์โทร</p>
                            <p className="text-sm font-medium">{delivery.deliveryPhone}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">วันที่จัดส่ง</p>
                            <p className="text-sm font-medium">
                              {new Date(delivery.deliveryDate).toLocaleDateString("th-TH", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">ที่อยู่จัดส่ง</p>
                            <p className="text-sm leading-relaxed">{delivery.deliveryAddress}</p>
                          </div>
                        </div>

                        {delivery.trackingNumber && (
                          <div className="flex items-start gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">หมายเลขติดตาม</p>
                              <p className="text-sm font-mono font-medium break-all">
                                {delivery.trackingNumber}
                              </p>
                              {delivery.trackingUrl && (
                                <a
                                  href={delivery.trackingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1"
                                >
                                  ตรวจสอบสถานะ
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleOpenDialog(delivery)}
                          data-testid={`button-edit-tracking-${delivery.id}`}
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          {delivery.trackingNumber ? "แก้ไขการจัดส่ง" : "เพิ่มข้อมูลจัดส่ง"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>ข้อมูลการจัดส่ง</DialogTitle>
                          <DialogDescription>
                            กรอกหมายเลขติดตามและลิงก์ตรวจสอบสถานะ
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="status">สถานะการจัดส่ง</Label>
                            <Select
                              value={editingTracking.status}
                              onValueChange={(value) =>
                                setEditingTracking((prev) => ({ ...prev, status: value }))
                              }
                            >
                              <SelectTrigger data-testid="select-delivery-status">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">รอจัดส่ง</SelectItem>
                                <SelectItem value="sent">จัดส่งแล้ว</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tracking-number">
                              หมายเลขติดตาม (Tracking Number)
                            </Label>
                            <Input
                              id="tracking-number"
                              placeholder="เช่น THOMOP2OBL"
                              value={editingTracking.trackingNumber}
                              onChange={(e) =>
                                setEditingTracking((prev) => ({
                                  ...prev,
                                  trackingNumber: e.target.value,
                                }))
                              }
                              data-testid="input-tracking-number"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tracking-url">ลิงก์ตรวจสอบสถานะ</Label>
                            <Input
                              id="tracking-url"
                              placeholder="https://track.thailandpost.th/tracking/THOMOP2OBL"
                              value={editingTracking.trackingUrl}
                              onChange={(e) =>
                                setEditingTracking((prev) => ({
                                  ...prev,
                                  trackingUrl: e.target.value,
                                }))
                              }
                              data-testid="input-tracking-url"
                            />
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button
                              onClick={handleSaveTracking}
                              className="flex-1"
                              disabled={updateDeliveryMutation.isPending}
                              data-testid="button-save-tracking"
                            >
                              {updateDeliveryMutation.isPending && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              )}
                              <Save className="h-4 w-4 mr-2" />
                              บันทึก
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
