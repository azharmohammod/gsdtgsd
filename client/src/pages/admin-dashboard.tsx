import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Gift, Star, UserCheck, UserX, Clock, Loader2, AlertCircle, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  totalUsers: number;
  activeMembers: number;
  pendingApprovals: number;
  expiringSoon: number;
  upcomingEvents: number;
  totalReviews: number;
  averageRating: number;
  giftsDelivered: number;
  totalPayments: number;
  verifiedPayments: number;
  pendingPayments: number;
}

interface LocationStats {
  total: number;
  provinces: Array<{ province: string; count: number }>;
  districts: Array<{ district: string; province: string; count: number }>;
  subdistricts: Array<{ subdistrict: string; district: string; province: string; count: number }>;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard/stats"],
  });
  
  const { data: locationStats, isLoading: locationLoading } = useQuery<LocationStats>({
    queryKey: ["/api/admin/location-stats"],
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">ไม่สามารถโหลดข้อมูลได้</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">แดชบอร์ด</h1>
        <p className="text-muted-foreground">ภาพรวมระบบและสถิติทั้งหมด</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สมาชิกทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-users">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">สมาชิกทั้งหมดในระบบ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สมาชิกที่ใช้งานอยู่</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 ? ((stats.activeMembers / stats.totalUsers) * 100).toFixed(1) : 0}% ของทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รอการอนุมัติ</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">ต้องดำเนินการ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ใกล้หมดอายุ</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">ใน 7 วันข้างหน้า</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การชำระเงินทั้งหมด</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-payments">{stats.totalPayments}</div>
            <p className="text-xs text-muted-foreground">รายการชำระเงินทั้งหมด</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การชำระที่ยืนยันแล้ว</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="stat-verified-payments">{stats.verifiedPayments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPayments > 0 ? ((stats.verifiedPayments / stats.totalPayments) * 100).toFixed(1) : 0}% ของทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รอตรวจสอบการชำระ</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="stat-pending-payments">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">รายการรอดำเนินการ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ของขวัญที่จัดส่ง</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-gifts-delivered">{stats.giftsDelivered}</div>
            <p className="text-xs text-muted-foreground">ชิ้น</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">กิจกรรมที่กำลังมา</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-upcoming-events">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">กิจกรรม</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รีวิวทั้งหมด</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-reviews">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              {stats.averageRating > 0 ? `เรตติ้งเฉลี่ย ${stats.averageRating}/5` : 'ยังไม่มีรีวิว'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สมาชิกที่ต้องดำเนินการ</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals + stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">รอการอนุมัติและกำลังหมดอายุ</p>
          </CardContent>
        </Card>
      </div>

      {/* Location Statistics */}
      {locationStats && locationStats.total > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              ข้อมูลที่อยู่ลูกค้า
            </h2>
            <p className="text-muted-foreground">
              สถิติตำแหน่งที่อยู่จากการสั่งของขวัญทั้งหมด {locationStats.total} ครั้ง
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Top Provinces */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">จังหวัด (Top 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {locationStats.provinces.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{item.province}</span>
                      <span className="text-sm font-medium">{item.count} ครั้ง</span>
                    </div>
                  ))}
                  {locationStats.provinces.length === 0 && (
                    <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Districts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">เขต/อำเภอ (Top 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {locationStats.districts.slice(0, 10).map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{item.district}</span>
                        <span className="text-sm font-medium">{item.count} ครั้ง</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.province}</p>
                    </div>
                  ))}
                  {locationStats.districts.length === 0 && (
                    <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Subdistricts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">แขวง/ตำบล (Top 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {locationStats.subdistricts.slice(0, 10).map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{item.subdistrict}</span>
                        <span className="text-sm font-medium">{item.count} ครั้ง</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.district}, {item.province}
                      </p>
                    </div>
                  ))}
                  {locationStats.subdistricts.length === 0 && (
                    <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
