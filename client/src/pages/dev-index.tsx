import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield } from "lucide-react";

export default function DevIndex() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">ระบบสมาชิกออนไลน์</h1>
          <p className="text-muted-foreground">เลือกส่วนที่ต้องการเข้าใช้งาน</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Panel */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/member")}>
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-center">หน้าสมาชิก</CardTitle>
              <CardDescription className="text-center">
                พื้นที่สำหรับสมาชิก - ดูกิจกรรม เลือกของขวัญ เขียนรีวิว
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setLocation("/member")} data-testid="button-goto-member">
                เข้าสู่หน้าสมาชิก
              </Button>
            </CardContent>
          </Card>

          {/* Admin Panel */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/admin/login")}>
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-center">หน้าแอดมิน</CardTitle>
              <CardDescription className="text-center">
                แผงควบคุม - จัดการผู้ใช้ กิจกรรม เว็บไซต์ และรีวิว
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setLocation("/admin/login")} data-testid="button-goto-admin-login">
                เข้าสู่หน้าแอดมิน
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ลิงก์ด่วน (สำหรับการพัฒนา)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setLocation("/register")}>
                ลงทะเบียน
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation("/payment")}>
                ชำระเงิน
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation("/member")}>
                พื้นที่สมาชิก
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation("/admin/dashboard")}>
                Admin Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation("/admin/users")}>
                Admin Users
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation("/admin/events")}>
                Admin Events
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation("/admin/gifts")}>
                Admin Gifts
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation("/admin/website")}>
                Admin Website
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation("/admin/terms")}>
                Admin Terms
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation("/admin/reviews")}>
                Admin Reviews
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
