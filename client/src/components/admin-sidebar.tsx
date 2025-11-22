import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Calendar, Globe, Star, Gift, FileText, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";

const menuItems = [
  {
    title: "แดชบอร์ด",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "ผู้ใช้งาน",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "จัดการแอดมิน",
    url: "/admin/admins",
    icon: ShieldCheck,
  },
  {
    title: "กำหนดการกิจกรรม",
    url: "/admin/events",
    icon: Calendar,
  },
  {
    title: "จัดการของขวัญ",
    url: "/admin/gifts",
    icon: Gift,
  },
  {
    title: "แก้ไขเว็บไซต์",
    url: "/admin/website",
    icon: Globe,
  },
  {
    title: "ข้อกำหนดและเงื่อนไข",
    url: "/admin/terms",
    icon: FileText,
  },
  {
    title: "จัดการรีวิว",
    url: "/admin/reviews",
    icon: Star,
  },
];

export function AdminSidebar() {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    console.log("Admin logout");
    setLocation("/admin/login");
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg"></div>
          <div>
            <h2 className="font-semibold">แผงควบคุมแอดมิน</h2>
            <p className="text-xs text-muted-foreground">ระบบจัดการ</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>เมนูหลัก</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.url.split('/').pop()}`}
                  >
                    <a href={item.url} onClick={(e) => {
                      e.preventDefault();
                      setLocation(item.url);
                    }}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
          data-testid="button-admin-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          ออกจากระบบ
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
