import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Upload, Save, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Gift, GiftImage } from "@shared/schema";

type GiftWithImages = Gift & { 
  images?: GiftImage[];
  usedThisMonth?: number;
  remainingQuota?: number | null;
};

export default function AdminGiftsCatalog() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedGift, setSelectedGift] = useState<GiftWithImages | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [editingGift, setEditingGift] = useState<Partial<Gift>>({});

  // Fetch all gifts
  const { data: gifts = [], isLoading } = useQuery<GiftWithImages[]>({
    queryKey: ["/api/admin/gifts-catalog"],
  });

  // Upload gift image
  const uploadImageMutation = useMutation({
    mutationFn: async ({ file, giftId }: { file: File; giftId: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await fetch('/api/upload/gift-image', {
        method: 'POST',
        body: formData,
      });
      if (!uploadResponse.ok) throw new Error('Upload failed');
      const { url } = await uploadResponse.json();
      
      // Create gift image record
      return apiRequest("POST", "/api/admin/gift-images", {
        giftId,
        imageUrl: url,
        sortOrder: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gifts-catalog"] });
      toast({
        title: "อัพโหลดสำเร็จ",
        description: "เพิ่มรูปภาพเรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพโหลดรูปภาพได้",
        variant: "destructive",
      });
    },
  });

  // Update gift
  const updateGiftMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Gift> }) => {
      return apiRequest("PUT", `/api/admin/gifts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gifts-catalog"] });
      setSelectedGift(null);
      toast({
        title: "บันทึกสำเร็จ",
        description: "แก้ไขของขวัญเรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแก้ไขของขวัญได้",
        variant: "destructive",
      });
    },
  });

  // Delete gift image
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      return apiRequest("DELETE", `/api/admin/gift-images/${imageId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gifts-catalog"] });
      toast({
        title: "ลบสำเร็จ",
        description: "ลบรูปภาพเรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบรูปภาพได้",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (giftId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingFor(giftId);
    
    // Upload all selected files
    Array.from(files).forEach(file => {
      uploadImageMutation.mutate({ file, giftId });
    });
  };

  const handleEditGift = (gift: Gift) => {
    setSelectedGift(gift);
    setEditingGift(gift);
  };

  const handleSaveGift = () => {
    if (!selectedGift) return;
    updateGiftMutation.mutate({
      id: selectedGift.id,
      data: editingGift,
    });
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">จัดการของขวัญ</h2>
          <p className="text-muted-foreground">แก้ไขรายละเอียดและรูปภาพของขวัญ</p>
        </div>
      </div>

      <div className="grid gap-6">
        {gifts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">ยังไม่มีของขวัญ</p>
            </CardContent>
          </Card>
        ) : (
          gifts.map((gift) => (
            <Card key={gift.id}>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Images Section */}
                  <div className="space-y-4">
                    <div>
                      <Label>รูปภาพของขวัญ</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        อัพโหลดได้ไม่จำกัดจำนวน
                      </p>
                      
                      {/* Display all images in grid */}
                      {gift.images && gift.images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {gift.images.map((image, index) => (
                            <div 
                              key={image.id} 
                              className="relative aspect-square rounded-lg overflow-hidden border"
                            >
                              <img 
                                src={`/api/uploads/${image.imageUrl}`} 
                                alt={`${gift.name} - รูปที่ ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {/* Primary badge for first image */}
                              {index === 0 && (
                                <Badge 
                                  className="absolute top-2 left-2 bg-primary text-primary-foreground"
                                >
                                  รูปหลัก
                                </Badge>
                              )}
                              {/* Delete button - always visible for accessibility */}
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => deleteImageMutation.mutate(image.id)}
                                disabled={deleteImageMutation.isPending}
                                aria-label={`ลบรูปภาพที่ ${index + 1} ของ ${gift.name}`}
                                data-testid={`button-delete-image-${image.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mb-4 p-8 border border-dashed rounded-lg text-center">
                          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">ยังไม่มีรูปภาพ</p>
                        </div>
                      )}

                      {/* Upload button */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect(gift.id)}
                        data-testid={`input-gift-images-${gift.id}`}
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFor === gift.id}
                        data-testid={`button-upload-images-${gift.id}`}
                      >
                        {uploadingFor === gift.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        เพิ่มรูปภาพ (ไม่จำกัด)
                      </Button>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-lg font-semibold">{gift.name}</Label>
                      {gift.monthlyQuota !== null && gift.monthlyQuota !== undefined ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary">
                            โควต้ารายเดือน: {gift.monthlyQuota}
                          </Badge>
                          <Badge variant="secondary">
                            ใช้ไปแล้ว: {gift.usedThisMonth || 0}
                          </Badge>
                          <Badge 
                            variant={gift.remainingQuota !== null && gift.remainingQuota !== undefined && gift.remainingQuota > 0 ? "default" : "destructive"}
                            className={gift.remainingQuota !== null && gift.remainingQuota !== undefined && gift.remainingQuota > 0 ? "bg-green-600" : ""}
                          >
                            เหลือ: {gift.remainingQuota !== null && gift.remainingQuota !== undefined ? gift.remainingQuota : 0}
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="mt-2">
                          ไม่จำกัดจำนวน
                        </Badge>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-sm text-muted-foreground">คำอธิบาย</Label>
                      <p className="text-sm">{gift.description}</p>
                    </div>

                    <div>
                      <Label className="text-sm text-muted-foreground">รายละเอียด</Label>
                      <p className="text-sm whitespace-pre-line">{gift.details}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={gift.active ? "default" : "secondary"}>
                        {gift.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => handleEditGift(gift)}
                          data-testid={`button-edit-gift-${gift.id}`}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          แก้ไขของขวัญ
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>แก้ไขของขวัญ</DialogTitle>
                          <DialogDescription>
                            แก้ไขรายละเอียดของขวัญ
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="gift-name">ชื่อของขวัญ</Label>
                            <Input
                              id="gift-name"
                              value={editingGift.name || ""}
                              onChange={(e) =>
                                setEditingGift({ ...editingGift, name: e.target.value })
                              }
                              data-testid="input-edit-gift-name"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="gift-description">คำอธิบาย</Label>
                            <Textarea
                              id="gift-description"
                              value={editingGift.description || ""}
                              onChange={(e) =>
                                setEditingGift({ ...editingGift, description: e.target.value })
                              }
                              rows={3}
                              data-testid="textarea-edit-gift-description"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="gift-details">รายละเอียด</Label>
                            <Textarea
                              id="gift-details"
                              value={editingGift.details || ""}
                              onChange={(e) =>
                                setEditingGift({ ...editingGift, details: e.target.value })
                              }
                              rows={5}
                              data-testid="textarea-edit-gift-details"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="gift-quota">โควต้ารายเดือน</Label>
                            <Input
                              id="gift-quota"
                              type="number"
                              placeholder="ไม่จำกัด (เว้นว่างหรือ 0)"
                              value={editingGift.monthlyQuota || ""}
                              onChange={(e) =>
                                setEditingGift({
                                  ...editingGift,
                                  monthlyQuota: e.target.value ? parseInt(e.target.value) : null,
                                })
                              }
                              data-testid="input-edit-gift-quota"
                            />
                            <p className="text-xs text-muted-foreground">
                              จำนวนที่สมาชิกสามารถเลือกได้ต่อเดือน (เว้นว่างหมายถึงไม่จำกัด)
                            </p>
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button
                              onClick={handleSaveGift}
                              className="flex-1"
                              disabled={updateGiftMutation.isPending}
                              data-testid="button-save-edit-gift"
                            >
                              {updateGiftMutation.isPending && (
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
    </div>
  );
}
