import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Save, Image, DollarSign, CreditCard, MessageCircle, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SiteSettings, Terms } from "@shared/schema";

export default function AdminWebsite() {
  const { toast } = useToast();
  const qrFileInputRef = useRef<HTMLInputElement>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);

  // Fetch site settings
  const { data: settings, isLoading: settingsLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/admin/site-settings"],
  });

  // Fetch terms
  const { data: terms, isLoading: termsLoading } = useQuery<Terms>({
    queryKey: ["/api/admin/terms"],
  });

  // Local state for editing
  const [editedSettings, setEditedSettings] = useState<Partial<SiteSettings>>({});
  const [editedTerms, setEditedTerms] = useState({
    content: "",
    showOnRegistration: true,
    showOnPayment: true,
    requireRead: false,
  });

  // Update local state when data loads
  useEffect(() => {
    if (settings) {
      setEditedSettings(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (terms) {
      setEditedTerms({
        content: terms.content,
        showOnRegistration: terms.showOnRegistration,
        showOnPayment: terms.showOnPayment,
        requireRead: terms.requireRead,
      });
    }
  }, [terms]);

  // QR Code upload mutation
  const qrUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload/qr-code', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json() as Promise<{ url: string }>;
    },
    onSuccess: (data) => {
      setEditedSettings((prev) => ({ ...prev, qrCodePath: data.url }));
      toast({
        title: "อัพโหลดสำเร็จ",
        description: "อัพโหลด QR Code สำเร็จแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพโหลด QR Code ได้",
        variant: "destructive",
      });
    },
  });

  // Settings update mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<SiteSettings>) => {
      return apiRequest("PUT", "/api/admin/site-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
      toast({
        title: "บันทึกสำเร็จ",
        description: "บันทึกการตั้งค่าเรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive",
      });
    },
  });

  // Terms update mutation
  const updateTermsMutation = useMutation({
    mutationFn: async (data: Partial<Terms>) => {
      return apiRequest("PUT", "/api/admin/terms", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/terms"] });
      toast({
        title: "บันทึกสำเร็จ",
        description: "บันทึกข้อกำหนดเรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อกำหนดได้",
        variant: "destructive",
      });
    },
  });

  const handleQrFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setQrPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    qrUploadMutation.mutate(file);
  };

  const handleSavePricing = () => {
    updateSettingsMutation.mutate({
      membershipPrice: editedSettings.membershipPrice,
    });
  };

  const handleSavePayment = () => {
    updateSettingsMutation.mutate({
      qrCodePath: editedSettings.qrCodePath,
      bankName: editedSettings.bankName,
      bankAccount: editedSettings.bankAccount,
      bankAccountName: editedSettings.bankAccountName,
    });
  };

  const handleSaveContact = () => {
    updateSettingsMutation.mutate({
      lineUrl: editedSettings.lineUrl,
    });
  };

  const handleSaveTerms = () => {
    updateTermsMutation.mutate(editedTerms);
  };

  if (settingsLoading || termsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">แก้ไขเว็บไซต์</h1>
        <p className="text-muted-foreground">จัดการเนื้อหาและการตั้งค่าเว็บไซต์</p>
      </div>

      <Tabs defaultValue="pricing" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="pricing" data-testid="tab-pricing">
            <DollarSign className="h-4 w-4 mr-2" />
            ราคา
          </TabsTrigger>
          <TabsTrigger value="payment" data-testid="tab-payment">
            <CreditCard className="h-4 w-4 mr-2" />
            การชำระเงิน
          </TabsTrigger>
          <TabsTrigger value="contact" data-testid="tab-contact">
            <MessageCircle className="h-4 w-4 mr-2" />
            ติดต่อ
          </TabsTrigger>
          <TabsTrigger value="terms" data-testid="tab-terms">
            <FileText className="h-4 w-4 mr-2" />
            ข้อกำหนด
          </TabsTrigger>
        </TabsList>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ตั้งค่าราคา</CardTitle>
              <CardDescription>กำหนดราคาสมาชิกรายเดือน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="membership-price">ราคาสมาชิก 30 วัน (บาท)</Label>
                <Input
                  id="membership-price"
                  type="number"
                  value={editedSettings.membershipPrice || 499}
                  onChange={(e) =>
                    setEditedSettings({
                      ...editedSettings,
                      membershipPrice: parseInt(e.target.value) || 0,
                    })
                  }
                  data-testid="input-price"
                />
              </div>
              <Button
                onClick={handleSavePricing}
                disabled={updateSettingsMutation.isPending}
                data-testid="button-save-price"
              >
                {updateSettingsMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <Save className="h-4 w-4 mr-2" />
                บันทึกการเปลี่ยนแปลง
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลการชำระเงิน</CardTitle>
              <CardDescription>QR Code และข้อมูลบัญชีธนาคาร</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>QR Code สำหรับชำระเงิน</Label>
                  <div className="mt-2">
                    {(qrPreview || editedSettings.qrCodePath) && (
                      <div className="mb-4 border rounded-lg overflow-hidden max-w-xs">
                        <img
                          src={qrPreview || `/api/uploads/${editedSettings.qrCodePath}`}
                          alt="QR Code"
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                    <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-3">
                      <Image className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">อัพโหลด QR Code</p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG (แนะนำ 512x512px)
                        </p>
                      </div>
                      <input
                        ref={qrFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleQrFileSelect}
                        data-testid="input-qr-file"
                      />
                      <Button
                        variant="outline"
                        onClick={() => qrFileInputRef.current?.click()}
                        disabled={qrUploadMutation.isPending}
                        data-testid="button-upload-qr"
                      >
                        {qrUploadMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        เลือกไฟล์
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-name">ชื่อธนาคาร</Label>
                  <Input
                    id="bank-name"
                    value={editedSettings.bankName || ""}
                    onChange={(e) =>
                      setEditedSettings({ ...editedSettings, bankName: e.target.value })
                    }
                    data-testid="input-bank-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-account">เลขที่บัญชี</Label>
                  <Input
                    id="bank-account"
                    value={editedSettings.bankAccount || ""}
                    onChange={(e) =>
                      setEditedSettings({ ...editedSettings, bankAccount: e.target.value })
                    }
                    data-testid="input-bank-account"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-account-name">ชื่อบัญชี</Label>
                  <Input
                    id="bank-account-name"
                    value={editedSettings.bankAccountName || ""}
                    onChange={(e) =>
                      setEditedSettings({ ...editedSettings, bankAccountName: e.target.value })
                    }
                    data-testid="input-bank-account-name"
                  />
                </div>
              </div>

              <Button
                onClick={handleSavePayment}
                disabled={updateSettingsMutation.isPending}
                data-testid="button-save-payment"
              >
                {updateSettingsMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <Save className="h-4 w-4 mr-2" />
                บันทึกการเปลี่ยนแปลง
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลการติดต่อ</CardTitle>
              <CardDescription>ลิงก์ Line และช่องทางการติดต่อ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="line-url">ลิงก์ Line Official</Label>
                <Input
                  id="line-url"
                  placeholder="https://line.me/R/ti/p/@..."
                  value={editedSettings.lineUrl || ""}
                  onChange={(e) =>
                    setEditedSettings({ ...editedSettings, lineUrl: e.target.value })
                  }
                  data-testid="input-line-url"
                />
                <p className="text-xs text-muted-foreground">
                  ใส่ลิงก์ Line Official Account
                </p>
              </div>

              <Button
                onClick={handleSaveContact}
                disabled={updateSettingsMutation.isPending}
                data-testid="button-save-contact"
              >
                {updateSettingsMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <Save className="h-4 w-4 mr-2" />
                บันทึกการเปลี่ยนแปลง
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Terms Tab */}
        <TabsContent value="terms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ข้อกำหนดและเงื่อนไข</CardTitle>
              <CardDescription>แก้ไขข้อความข้อกำหนดการใช้งาน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="terms">ข้อกำหนดและเงื่อนไข</Label>
                <Textarea
                  id="terms"
                  rows={12}
                  value={editedTerms.content}
                  onChange={(e) =>
                    setEditedTerms({ ...editedTerms, content: e.target.value })
                  }
                  data-testid="textarea-terms"
                />
                <p className="text-xs text-muted-foreground">
                  แต่ละบรรทัดจะแสดงเป็นข้อแยกกัน
                </p>
              </div>

              <Button
                onClick={handleSaveTerms}
                disabled={updateTermsMutation.isPending}
                data-testid="button-save-terms"
              >
                {updateTermsMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <Save className="h-4 w-4 mr-2" />
                บันทึกการเปลี่ยนแปลง
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
