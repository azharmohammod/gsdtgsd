import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      return await apiRequest("POST", "/api/admin/auth/login", data);
    },
    onSuccess: () => {
      toast({
        title: "เข้าสู่ระบบสำเร็จ",
      });
      setLocation("/admin/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(credentials);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">ระบบจัดการแอดมิน</CardTitle>
          <CardDescription>กรุณาเข้าสู่ระบบเพื่อเข้าถึงแผงควบคุม</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-username">ชื่อผู้ใช้</Label>
              <Input
                id="admin-username"
                type="text"
                placeholder="admin"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                data-testid="input-admin-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">รหัสผ่าน</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                data-testid="input-admin-password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              data-testid="button-admin-login"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </form>
          
          {/* Temporary access links for development */}
          <div className="mt-6 pt-6 border-t space-y-2">
            <p className="text-xs text-center text-muted-foreground mb-3">
              ทางลัด (สำหรับการพัฒนา)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setLocation("/member")}
                data-testid="button-goto-user"
              >
                หน้าสมาชิก
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setLocation("/admin/dashboard")}
                data-testid="button-goto-admin"
              >
                หน้าแอดมิน
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
