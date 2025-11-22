import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Eye, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Terms } from "@shared/schema";

const defaultTermsContent = `ข้อกำหนดและเงื่อนไขการใช้บริการ

1. การสมัครสมาชิก
- สมาชิกต้องชำระค่าบริการล่วงหน้าเป็นรายเดือน
- ค่าสมาชิกไม่สามารถคืนเงินได้ทุกกรณี
- การสมัครสมาชิกจะเริ่มนับหลังจากการชำระเงินได้รับการตรวจสอบและอนุมัติ

2. สิทธิประโยชน์สมาชิก
- เข้าร่วมกิจกรรมไลฟ์สตรีมทุกครั้ง (Zoom และ Vimeo)
- สิทธิ์เลือกของขวัญ 1 รายการต่อเดือน
- ดูกิจกรรมย้อนหลังได้ตลอดระยะเวลาเป็นสมาชิก

3. การจัดส่งของขวัญ
- สมาชิกสามารถเลือกวันจัดส่งได้ระหว่างวันที่ 8-30 ของเดือน
- ของขวัญจะถูกจัดส่งตามวันที่สมาชิกจอง
- สมาชิกต้องกรอกที่อยู่จัดส่งให้ถูกต้องและครบถ้วน
- เราไม่รับผิดชอบหากของขวัญสูญหายหรือเสียหายระหว่างการจัดส่ง เนื่องจากความผิดพลาดของบริษัทขนส่ง

4. การยกเลิกสมาชิก
- สมาชิกสามารถยกเลิกได้ทุกเมื่อ
- ไม่มีการคืนเงินค่าสมาชิกที่ชำระไปแล้ว
- สมาชิกสามารถใช้สิทธิ์ได้จนครบระยะเวลาที่ชำระไว้

5. ความรับผิดชอบ
- เราขอสงวนสิทธิ์ในการเปลี่ยนแปลงเนื้อหากิจกรรม เวลา และวิทยากรโดยไม่ต้องแจ้งให้ทราบล่วงหน้า
- เราไม่รับผิดชอบต่อความเสียหายใดๆ ที่เกิดจากการใช้บริการ
- ข้อมูลส่วนตัวของสมาชิกจะถูกเก็บรักษาอย่างปลอดภัยและไม่เปิดเผยต่อบุคคลที่สาม

6. การแก้ไขข้อกำหนด
- เราขอสงวนสิทธิ์ในการแก้ไขข้อกำหนดและเงื่อนไขได้ทุกเมื่อ
- การแก้ไขจะมีผลทันทีเมื่อประกาศบนเว็บไซต์
- สมาชิกควรตรวจสอบข้อกำหนดเป็นประจำ

7. การติดต่อ
- หากมีข้อสงสัยหรือต้องการความช่วยเหลือ สามารถติดต่อเราผ่านทาง Line หรืออีเมล

วันที่มีผล: 16 พฤศจิกายน 2568
อัปเดตล่าสุด: 16 พฤศจิกายน 2568`;

export default function AdminTerms() {
  const [termsContent, setTermsContent] = useState(defaultTermsContent);
  const [showOnRegistration, setShowOnRegistration] = useState(true);
  const [showOnPayment, setShowOnPayment] = useState(true);
  const [requireRead, setRequireRead] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  // Fetch current terms
  const { data: terms, isLoading } = useQuery<Terms | null>({
    queryKey: ["/api/admin/terms"],
  });

  // Update state when terms are loaded
  useEffect(() => {
    if (terms) {
      setTermsContent(terms.content);
      setShowOnRegistration(terms.showOnRegistration);
      setShowOnPayment(terms.showOnPayment);
      setRequireRead(terms.requireRead);
    }
  }, [terms]);

  // Update terms mutation
  const updateTermsMutation = useMutation({
    mutationFn: async (data: {
      content: string;
      showOnRegistration: boolean;
      showOnPayment: boolean;
      requireRead: boolean;
    }) => {
      return apiRequest("PUT", "/api/admin/terms", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/terms"] });
      toast({
        title: "บันทึกข้อกำหนดสำเร็จ",
        description: "บันทึกข้อกำหนดและเงื่อนไขเรียบร้อยแล้ว",
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

  const handleSave = () => {
    updateTermsMutation.mutate({
      content: termsContent,
      showOnRegistration,
      showOnPayment,
      requireRead,
    });
  };

  const handleReset = () => {
    setTermsContent(defaultTermsContent);
    toast({
      title: "รีเซ็ตเรียบร้อย",
      description: "กลับไปยังข้อกำหนดเริ่มต้นแล้ว",
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
      <div>
        <h1 className="text-3xl font-bold">ข้อกำหนดและเงื่อนไข</h1>
        <p className="text-muted-foreground">แก้ไขข้อกำหนดและเงื่อนไขการใช้บริการ</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                เนื้อหาข้อกำหนดและเงื่อนไข
              </CardTitle>
              <CardDescription>
                แก้ไขเนื้อหาที่จะแสดงในหน้าข้อกำหนดและเงื่อนไข
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogTrigger asChild>
                  <Button variant="outline" data-testid="button-preview-terms">
                    <Eye className="h-4 w-4 mr-2" />
                    ดูตัวอย่าง
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>ตัวอย่างข้อกำหนดและเงื่อนไข</DialogTitle>
                    <DialogDescription>
                      แสดงเนื้อหาตามที่จะปรากฏให้สมาชิกเห็น
                    </DialogDescription>
                  </DialogHeader>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {termsContent}
                    </pre>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="terms-content">เนื้อหา</Label>
            <Textarea
              id="terms-content"
              value={termsContent}
              onChange={(e) => setTermsContent(e.target.value)}
              className="min-h-[600px] font-mono text-sm"
              placeholder="กรอกข้อกำหนดและเงื่อนไขที่นี่..."
              data-testid="textarea-terms-content"
            />
            <p className="text-xs text-muted-foreground">
              จำนวนอักขระ: {termsContent.length}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              คำแนะนำในการเขียนข้อกำหนดและเงื่อนไข:
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>เขียนให้ชัดเจนและเข้าใจง่าย</li>
              <li>ระบุสิทธิและหน้าที่ของทั้งสองฝ่าย</li>
              <li>ระบุนโยบายการคืนเงินและการยกเลิก</li>
              <li>ระบุความรับผิดชอบและข้อจำกัด</li>
              <li>อัปเดตวันที่มีผลและวันที่แก้ไข</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              data-testid="button-reset-terms"
            >
              รีเซ็ตเป็นค่าเริ่มต้น
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={updateTermsMutation.isPending}
              data-testid="button-save-terms"
            >
              {updateTermsMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Save className="h-4 w-4 mr-2" />
              บันทึกการเปลี่ยนแปลง
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>ตั้งค่าการแสดงผล</CardTitle>
          <CardDescription>กำหนดวิธีการแสดงข้อกำหนดและเงื่อนไข</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">แสดงที่หน้าลงทะเบียน</p>
                <p className="text-xs text-muted-foreground">
                  ผู้ใช้ต้องยอมรับข้อกำหนดก่อนลงทะเบียน
                </p>
              </div>
              <Switch
                checked={showOnRegistration}
                onCheckedChange={setShowOnRegistration}
                data-testid="switch-show-on-registration"
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">แสดงที่หน้าชำระเงิน</p>
                <p className="text-xs text-muted-foreground">
                  แสดงข้อกำหนดในหน้าชำระเงิน
                </p>
              </div>
              <Switch
                checked={showOnPayment}
                onCheckedChange={setShowOnPayment}
                data-testid="switch-show-on-payment"
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">บังคับให้อ่าน</p>
                <p className="text-xs text-muted-foreground">
                  ผู้ใช้ต้องเลื่อนอ่านจนจบก่อนกดยอมรับ
                </p>
              </div>
              <Switch
                checked={requireRead}
                onCheckedChange={setRequireRead}
                data-testid="switch-require-read"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSave}
              disabled={updateTermsMutation.isPending}
              data-testid="button-save-display-settings"
            >
              {updateTermsMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              บันทึกการตั้งค่า
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
