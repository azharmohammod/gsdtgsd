import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Upload, CheckCircle2, ArrowLeft, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Member } from "@shared/schema";
import qrCodeImage from "@assets/generated_images/Bank_Transfer_QR_Code_23cbed4a.png";

export default function PaymentPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const PAYMENT_AMOUNT = 390;

  const bankDetails = {
    bankName: "ธนาคารกสิกรไทย",
    accountName: "บริษัท สมาชิกพรีเมียม จำกัด",
    accountNumber: "123-4-56789-0",
    amount: `฿${PAYMENT_AMOUNT}`,
    period: "30 วัน",
  };

  // Get current member data
  const { data: member, isLoading: memberLoading } = useQuery<Member>({
    queryKey: ["/api/auth/me"],
  });

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload/payment-slip', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Upload failed');
      }
      
      return res.json() as Promise<{ url: string }>;
    },
    onError: (error: Error) => {
      toast({
        title: "การอัพโหลดล้มเหลว",
        description: error.message.includes('file type') 
          ? "กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น (JPG, PNG, WEBP)"
          : error.message.includes('5MB')
          ? "ขนาดไฟล์เกิน 5MB กรุณาเลือกไฟล์ที่เล็กกว่า"
          : "เกิดข้อผิดพลาดในการอัพโหลด กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    },
  });

  // Payment creation mutation
  const paymentMutation = useMutation({
    mutationFn: async (slipUrl: string) => {
      if (!member?.id) {
        throw new Error('Member ID not found');
      }
      
      return apiRequest('POST', '/api/payment/create', {
        memberId: member.id,
        amount: PAYMENT_AMOUNT,
        slipUrl,
      });
    },
    onSuccess: () => {
      toast({
        title: "สำเร็จ!",
        description: "อัพโหลดหลักฐานการชำระเงินสำเร็จ",
      });
      
      // Invalidate member data to refresh status
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Redirect to thank you page
      setTimeout(() => {
        setLocation("/thank-you");
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "การบันทึกข้อมูลล้มเหลว",
        description: "ไม่สามารถบันทึกข้อมูลการชำระเงินได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "คัดลอกแล้ว",
      description: `${label} ถูกคัดลอกไปยังคลิปบอร์ดแล้ว`,
    });
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return "กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น (JPG, PNG, WEBP)";
    }

    // Check file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return "ขนาดไฟล์เกิน 5MB กรุณาเลือกไฟล์ที่เล็กกว่า";
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "ไฟล์ไม่ถูกต้อง",
          description: error,
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    
    if (file) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "ไฟล์ไม่ถูกต้อง",
          description: error,
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile) return;

    if (!member?.id) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่พบข้อมูลสมาชิก กรุณาเข้าสู่ระบบอีกครั้ง",
        variant: "destructive",
      });
      return;
    }

    try {
      // Step 1: Upload the file
      const uploadResult = await uploadMutation.mutateAsync(uploadedFile);
      
      // Step 2: Create payment record with the uploaded file URL
      await paymentMutation.mutateAsync(uploadResult.url);
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error('Payment submission error:', error);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeImage;
    link.download = 'payment-qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "ดาวน์โหลดสำเร็จ",
      description: "QR Code ถูกดาวน์โหลดแล้ว",
    });
  };

  const isSubmitting = uploadMutation.isPending || paymentMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b py-4 px-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">สมาชิก</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">ชำระเงิน</h2>
          <p className="text-muted-foreground leading-relaxed">
            กรุณาโอนเงินตามรายละเอียดด้านล่าง และอัปโหลดสลิปการชำระเงิน
          </p>
        </div>

        {memberLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">รายละเอียดแพ็กเกจ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">แพ็กเกจ</span>
                  <span className="font-semibold">สมาชิกรายเดือน</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">ระยะเวลา</span>
                  <span className="font-semibold">{bankDetails.period}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">ราคา</span>
                  <span className="font-bold text-primary">{bankDetails.amount}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">ช่องทางการชำระเงิน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">สแกน QR Code เพื่อชำระเงิน</p>
                  <div className="inline-block p-4 bg-white rounded-lg">
                    <img src={qrCodeImage} alt="QR Code" className="w-48 h-48 mx-auto" data-testid="img-qr-code" />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={handleDownloadQR}
                    data-testid="button-download-qr"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    ดาวน์โหลด QR Code
                  </Button>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <p className="text-sm font-medium mb-4">หรือโอนเงินผ่านบัญชีธนาคาร</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">ธนาคาร</p>
                        <p className="font-medium">{bankDetails.bankName}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(bankDetails.bankName, "ชื่อธนาคาร")}
                        data-testid="button-copy-bank"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">ชื่อบัญชี</p>
                        <p className="font-medium">{bankDetails.accountName}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(bankDetails.accountName, "ชื่อบัญชี")}
                        data-testid="button-copy-account-name"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">เลขที่บัญชี</p>
                        <p className="font-mono font-medium">{bankDetails.accountNumber}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(bankDetails.accountNumber, "เลขที่บัญชี")}
                        data-testid="button-copy-account-number"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">อัปโหลดสลิปการชำระเงิน</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {uploadedFile ? (
                    <div className="space-y-4">
                      {previewUrl && (
                        <div className="mx-auto w-48 h-48 rounded-lg overflow-hidden border">
                          <img 
                            src={previewUrl} 
                            alt="Payment slip preview" 
                            className="w-full h-full object-cover"
                            data-testid="img-preview"
                          />
                        </div>
                      )}
                      <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
                      <div>
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleRemoveFile}
                        disabled={isSubmitting}
                        data-testid="button-remove-file"
                      >
                        เปลี่ยนไฟล์
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <p className="font-medium mb-1">ลากไฟล์มาวางที่นี่</p>
                        <p className="text-sm text-muted-foreground">หรือคลิกเพื่อเลือกไฟล์</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          รองรับไฟล์ JPG, PNG, WEBP (สูงสุด 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        data-testid="input-file"
                      />
                      <label htmlFor="file-upload">
                        <Button variant="outline" asChild>
                          <span>เลือกไฟล์</span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full mt-6 h-12"
                  disabled={!uploadedFile || isSubmitting}
                  onClick={handleSubmit}
                  data-testid="button-submit-payment"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploadMutation.isPending ? "กำลังอัพโหลดไฟล์..." : "กำลังบันทึกข้อมูล..."}
                    </>
                  ) : (
                    "ส่งหลักฐานการชำระเงิน"
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">ขั้นตอนถัดไป</h3>
                <ol className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                  <li>1. อัปโหลดสลิปการชำระเงิน</li>
                  <li>2. แอดมินจะตรวจสอบการชำระเงินของคุณ</li>
                  <li>3. เมื่อได้รับการยืนยัน คุณจะสามารถเข้าถึงพื้นที่สมาชิกได้</li>
                </ol>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">ต้องการความช่วยเหลือ?</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      หากมีคำถามเกี่ยวกับการชำระเงิน ติดต่อเราผ่าน Line
                    </p>
                    <Button variant="outline" className="bg-[#06C755] text-white hover:bg-[#06C755]/90" data-testid="button-line-support">
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"></path>
                      </svg>
                      ติดต่อผ่าน Line
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
