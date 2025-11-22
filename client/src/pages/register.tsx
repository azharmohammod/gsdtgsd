import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    prefix: "",
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { prefix: string; name: string; phone: string; password: string }) => {
      return await apiRequest("POST", "/api/auth/register", data);
    },
    onSuccess: () => {
      toast({
        title: "ลงทะเบียนสำเร็จ! กรุณาชำระเงิน",
      });
      setLocation("/payment");
    },
    onError: (error: Error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate confirmPassword matches password
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "รหัสผ่านไม่ตรงกัน",
        description: "กรุณากรอกรหัสผ่านให้ตรงกัน",
        variant: "destructive",
      });
      return;
    }

    // Validate acceptTerms is true
    if (!formData.acceptTerms) {
      toast({
        title: "กรุณายอมรับข้อกำหนดและเงื่อนไข",
        variant: "destructive",
      });
      return;
    }

    // Submit registration
    registerMutation.mutate({
      prefix: formData.prefix,
      name: formData.name,
      phone: formData.phone,
      password: formData.password,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b py-4 px-4">
        <div className="max-w-lg mx-auto flex items-center gap-4">
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

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">สมัครสมาชิก</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              กรุณากรอกข้อมูลเพื่อสมัครสมาชิก
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prefix">คำนำหน้า</Label>
                <Select
                  value={formData.prefix}
                  onValueChange={(value) => setFormData({ ...formData, prefix: value })}
                >
                  <SelectTrigger id="prefix" className="h-12" data-testid="select-prefix">
                    <SelectValue placeholder="เลือกคำนำหน้า" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="นาย">นาย</SelectItem>
                    <SelectItem value="นาง">นาง</SelectItem>
                    <SelectItem value="นางสาว">นางสาว</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="กรอกชื่อ-นามสกุล"
                  className="h-12"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="input-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0812345678"
                  className="h-12"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  data-testid="input-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="กรอกรหัสผ่าน"
                  className="h-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  data-testid="input-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  className="h-12"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  data-testid="input-confirm-password"
                />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, acceptTerms: checked as boolean })
                  }
                  data-testid="checkbox-terms"
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  ฉันยอมรับ <a href="#" className="text-primary hover:underline">ข้อกำหนดและเงื่อนไข</a>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12" 
                data-testid="button-register"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">มีบัญชีอยู่แล้ว? </span>
                <button
                  type="button"
                  onClick={() => setLocation("/login")}
                  className="text-primary hover:underline"
                  data-testid="link-login"
                >
                  เข้าสู่ระบบ
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
