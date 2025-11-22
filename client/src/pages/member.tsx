import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gift, Play, LogOut, CreditCard, Video, MessageCircle, CheckCircle, XCircle, Package, Star, ThumbsUp, User, Edit, Copy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Member, Gift as GiftType, GiftDelivery, Event, Review, GiftImage } from "@shared/schema";
import { sqlTimestampToDate } from "@/lib/datetime";

type GiftWithQuota = GiftType & {
  usedThisMonth: number;
  remainingQuota: number | null;
  images: GiftImage[];
};

function getFirstName(fullName: string): string {
  return fullName.split(/\s+/)[0];
}

function formatUserGreeting(member: Member): string {
  const firstName = getFirstName(member.name);
  return `คุณ${firstName}`;
}

function getDateAvailability(date: Date): { available: boolean; message: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  const diffTime = checkDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 8 || diffDays > 30) {
    return { available: false, message: "Sorry, the quota for this day is over." };
  }
  
  return { available: true, message: "Quota still available!" };
}

export default function MemberDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State for gift delivery
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [deliveryData, setDeliveryData] = useState({
    deliveryName: "",
    deliveryPhone: "",
    houseNumber: "",
    mooSoi: "",
    street: "",
    subdistrict: "",
    district: "",
    province: "",
    postalCode: "",
  });

  // State for profile edit
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileData, setProfileData] = useState({
    prefix: "",
    name: "",
    phone: "",
  });

  // State for review
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewData, setReviewData] = useState({
    title: "",
    content: "",
    pros: "",
    cons: "",
  });

  // Auth check - GET /api/auth/me
  const { data: member, isLoading: memberLoading, error: memberError } = useQuery<Member>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (memberError) {
      const errorMessage = memberError.message || '';
      if (errorMessage.includes('401')) {
        setLocation("/login");
      }
    }
  }, [memberError, setLocation]);

  // Get gifts with quota information
  const { data: gifts = [], isLoading: giftsLoading } = useQuery<GiftWithQuota[]>({
    queryKey: ["/api/member/gifts"],
    enabled: member?.status === 'approved',
  });

  // Get gift deliveries
  const { data: giftDeliveries = [] } = useQuery<GiftDelivery[]>({
    queryKey: ["/api/member/gift-delivery"],
    enabled: member?.status === 'approved',
  });

  // Get events
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/member/events"],
    enabled: member?.status === 'approved',
  });

  // Get reviews
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/member/reviews"],
    enabled: member?.status === 'approved',
  });

  // Get site settings for Line URL
  const { data: siteSettings } = useQuery<{ lineUrl: string }>({
    queryKey: ["/api/site-settings"],
    enabled: member?.status === 'approved',
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/login");
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { prefix: string; name: string; phone: string }) => {
      const response = await apiRequest("PUT", "/api/member/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "สำเร็จ",
        description: "อัพเดทข้อมูลสำเร็จ",
      });
      setShowProfileEdit(false);
    },
    onError: () => {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทข้อมูลได้",
        variant: "destructive",
      });
    },
  });

  // Gift delivery mutation
  const giftDeliveryMutation = useMutation({
    mutationFn: async (data: {
      giftId: string;
      deliveryDate: Date;
      deliveryName: string;
      deliveryPhone: string;
      houseNumber: string;
      mooSoi: string;
      street: string;
      subdistrict: string;
      district: string;
      province: string;
      postalCode: string;
    }) => {
      const response = await apiRequest("POST", "/api/member/gift-delivery", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/member/gift-delivery"] });
      toast({
        title: "สำเร็จ",
        description: "เลือกของขวัญสำเร็จ",
      });
      setShowDeliveryForm(false);
      setSelectedGift(null);
      setSelectedDate(undefined);
      setDeliveryData({ deliveryName: "", deliveryPhone: "", houseNumber: "", mooSoi: "", street: "", subdistrict: "", district: "", province: "", postalCode: "" });
    },
    onError: (error: any) => {
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "ไม่สามารถเลือกของขวัญได้",
        variant: "destructive",
      });
    },
  });

  // Review submission mutation
  const reviewMutation = useMutation({
    mutationFn: async (data: { rating: number; title: string; content: string; pros: string; cons: string }) => {
      const response = await apiRequest("POST", "/api/member/reviews", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "สำเร็จ",
        description: "ส่งรีวิวสำเร็จ รอการอนุมัติ",
      });
      setReviewRating(0);
      setReviewData({ title: "", content: "", pros: "", cons: "" });
    },
    onError: () => {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถส่งรีวิวได้",
        variant: "destructive",
      });
    },
  });

  // Review helpful mutation
  const reviewHelpfulMutation = useMutation({
    mutationFn: async ({ reviewId, helpful }: { reviewId: string; helpful: boolean }) => {
      await apiRequest("POST", `/api/member/review/${reviewId}/helpful`, { helpful });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/member/reviews"] });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleExtendMembership = () => {
    setLocation("/payment");
  };

  const handleGiftSelect = (giftId: string) => {
    setSelectedGift(giftId);
    setShowDeliveryForm(true);
    setSelectedDate(undefined);
    setDeliveryData({ deliveryName: "", deliveryPhone: "", houseNumber: "", mooSoi: "", street: "", subdistrict: "", district: "", province: "", postalCode: "" });
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGift || !selectedDate) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาเลือกของขวัญและวันที่จัดส่ง",
        variant: "destructive",
      });
      return;
    }

    giftDeliveryMutation.mutate({
      giftId: selectedGift,
      deliveryDate: selectedDate,
      deliveryName: deliveryData.deliveryName,
      deliveryPhone: deliveryData.deliveryPhone,
      houseNumber: deliveryData.houseNumber,
      mooSoi: deliveryData.mooSoi,
      street: deliveryData.street,
      subdistrict: deliveryData.subdistrict,
      district: deliveryData.district,
      province: deliveryData.province,
      postalCode: deliveryData.postalCode,
    });
  };

  const handleProfileEdit = () => {
    if (member) {
      setProfileData({
        prefix: member.prefix,
        name: member.name,
        phone: member.phone,
      });
      setShowProfileEdit(true);
    }
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาให้คะแนน",
        variant: "destructive",
      });
      return;
    }

    reviewMutation.mutate({
      rating: reviewRating,
      title: reviewData.title,
      content: reviewData.content,
      pros: reviewData.pros,
      cons: reviewData.cons,
    });
  };

  const handleJoinEvent = (eventId: string) => {
    setLocation(`/live/${eventId}`);
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const diffTime = checkDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays < 8 || diffDays > 30;
  };

  const dateAvailability = selectedDate ? getDateAvailability(selectedDate) : null;

  // Show loading state
  if (memberLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b py-4 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">สมาชิก</h1>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid gap-6 lg:grid-cols-3 mb-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </main>
      </div>
    );
  }

  // Show pending approval message
  if (member && member.status !== 'approved') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b py-4 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">สมาชิก</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              ออกจากระบบ
            </Button>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>รอการอนุมัติ</CardTitle>
              <CardDescription>
                บัญชีของคุณกำลังรอการอนุมัติจากผู้ดูแลระบบ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                กรุณารอการยืนยันการชำระเงินและการอนุมัติบัญชี 
                เราจะแจ้งให้คุณทราบทาง email เมื่อบัญชีของคุณได้รับการอนุมัติแล้ว
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  // Calculate membership progress
  const membershipEnd = member.membershipEnd ? new Date(member.membershipEnd) : null;
  const membershipStart = member.membershipStart ? new Date(member.membershipStart) : null;
  const now = new Date();
  
  let daysProgress = 0;
  let remainingDays = 0;
  let totalDays = 30;
  
  if (membershipEnd && membershipStart) {
    const totalTime = membershipEnd.getTime() - membershipStart.getTime();
    const elapsedTime = now.getTime() - membershipStart.getTime();
    remainingDays = Math.max(0, Math.ceil((membershipEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    totalDays = Math.ceil(totalTime / (1000 * 60 * 60 * 24));
    daysProgress = Math.max(0, Math.min(100, (elapsedTime / totalTime) * 100));
  }

  const membershipEndDate = membershipEnd ? membershipEnd.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'ไม่ระบุ';

  // Check if member already claimed gift
  const hasClaimedGift = giftDeliveries.length > 0;
  const latestDelivery = giftDeliveries[0];

  // Get status labels for gift delivery
  const getDeliveryStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "กำลังดำเนินการ",
      processing: "กำลังจัดส่ง",
      shipped: "จัดส่งแล้ว",
      delivered: "ได้รับแล้ว",
      sent: "จัดส่งแล้ว",
    };
    return labels[status] || status;
  };

  // Separate upcoming and past events
  const upcomingEvents = events.filter(e => new Date(e.eventDate) >= now);
  const pastEvents = events.filter(e => new Date(e.eventDate) < now);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">สมาชิก</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline" data-testid="text-member-name">
              {formatUserGreeting(member)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">พื้นที่สมาชิก</h2>
          <p className="text-muted-foreground" data-testid="text-welcome-message">ยินดีต้อนรับกลับมา {formatUserGreeting(member)}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          {/* Membership Details Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  รายละเอียดสมาชิก
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleProfileEdit}
                  data-testid="button-edit-profile"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">สิ้นสุดวันที่</span>
                  <span className="font-semibold" data-testid="text-membership-end">{membershipEndDate}</span>
                </div>
                <Progress value={daysProgress} className="h-2" data-testid="progress-membership" />
                <p className="text-xs text-muted-foreground mt-2">
                  เหลืออีก {remainingDays} วัน จาก {totalDays} วัน
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button
                  className="w-full"
                  onClick={handleExtendMembership}
                  data-testid="button-extend-membership"
                >
                  ต่อายุสมาชิก 30 วัน
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Gift Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                สถานะของขวัญ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasClaimedGift ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-600" data-testid="badge-gift-available">
                      พร้อมรับ
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    คุณมีสิทธิ์เลือกของขวัญ 1 รายการ
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    เลือกของขวัญข้างล่าง
                  </p>
                </div>
              ) : latestDelivery && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-600 text-white" data-testid="badge-gift-status">
                      {getDeliveryStatusLabel(latestDelivery.status)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">วันที่จัดส่ง</p>
                      <p className="text-sm font-medium" data-testid="text-delivery-date">
                        {new Date(latestDelivery.deliveryDate).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    {latestDelivery.trackingNumber && latestDelivery.trackingNumber.trim() !== '' ? (
                      <div className="pt-3 border-t space-y-3">
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                            ติดตามพัสดุใน 3 ขั้นตอน
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            1. คัดลอก หมายเลขติดตามพัสดุ
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-mono font-semibold break-all bg-muted px-3 py-2 rounded flex-1" data-testid="text-tracking-number">
                              {latestDelivery.trackingNumber}
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(latestDelivery.trackingNumber!);
                                  toast({
                                    title: "คัดลอกแล้ว",
                                    description: "คัดลอกหมายเลขติดตามพัสดุแล้ว",
                                  });
                                } catch (error) {
                                  toast({
                                    title: "เกิดข้อผิดพลาด",
                                    description: "ไม่สามารถคัดลอกได้ กรุณาลองอีกครั้ง",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              data-testid="button-copy-tracking"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            2. จำหมายเลข 4 ตัวท้าย 7883
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            3. ใส่ในเว็บไซต์ J&T Express
                          </p>
                          <a
                            href="https://jtexpress.co.th/service/track"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline break-all font-mono"
                            data-testid="link-gift-tracking"
                          >
                            https://jtexpress.co.th/service/track
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground italic">
                          เรากำลังเตรียมจัดส่งของขวัญให้คุณ จะแจ้งหมายเลขติดตามให้เร็วๆ นี้ค่ะ
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                ติดต่อเรา
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                หากคุณมีคำถามหรือต้องการความช่วยเหลือ สามารถติดต่อเราได้ทาง Line
              </p>
              <Button 
                variant="outline" 
                className="w-full bg-[#06C755] text-white hover:bg-[#06C755]/90"
                onClick={() => {
                  if (siteSettings?.lineUrl) {
                    window.open(siteSettings.lineUrl, '_blank');
                  }
                }}
                disabled={!siteSettings?.lineUrl}
                data-testid="button-line-contact"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"></path>
                </svg>
                ติดต่อผ่าน Line
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events" data-testid="tab-events">กิจกรรมไลฟ์</TabsTrigger>
            <TabsTrigger value="gifts" data-testid="tab-gifts">ของขวัญ</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">รีวิว</TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  กิจกรรมไลฟ์
                </CardTitle>
                <CardDescription>เข้าร่วมกิจกรรมไลฟ์หรือดูย้อนหลัง</CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">กิจกรรมที่กำลังมาถึง</h3>
                        <div className="space-y-3">
                          {upcomingEvents.map((event) => (
                            <div
                              key={event.id}
                              className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{event.title}</h4>
                                  <Badge variant="default" data-testid={`badge-event-${event.id}`}>
                                    กำลังมาถึง
                                  </Badge>
                                </div>
                                {event.description && (
                                  <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  {sqlTimestampToDate(event.eventDate).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    timeZone: 'Asia/Bangkok',
                                  })}
                                </p>
                              </div>
                              <Button
                                variant="default"
                                onClick={() => handleJoinEvent(event.id)}
                                data-testid={`button-event-${event.id}`}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                เข้าร่วม
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pastEvents.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">กิจกรรมที่ผ่านมา</h3>
                        <div className="space-y-3">
                          {pastEvents.map((event) => (
                            <div
                              key={event.id}
                              className="flex items-center justify-between p-4 rounded-lg border opacity-60"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{event.title}</h4>
                                  <Badge variant="secondary">ผ่านไปแล้ว</Badge>
                                </div>
                                {event.description && (
                                  <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  {sqlTimestampToDate(event.eventDate).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    timeZone: 'Asia/Bangkok',
                                  })}
                                </p>
                              </div>
                              {event.replayUrl && (
                                <Button
                                  variant="outline"
                                  onClick={() => handleJoinEvent(event.id)}
                                  data-testid={`button-event-${event.id}`}
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  ดูย้อนหลัง
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {events.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        ยังไม่มีกิจกรรม
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gifts Tab */}
          <TabsContent value="gifts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  เลือกของขวัญ
                </CardTitle>
                <CardDescription>
                  {hasClaimedGift
                    ? "คุณได้เลือกของขวัญแล้ว"
                    : "เลือกของขวัญ 1 รายการจากรายการด้านล่าง"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {giftsLoading ? (
                  <div className="grid md:grid-cols-3 gap-6">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6">
                    {gifts.map((gift) => {
                      const isQuotaDepleted = gift.remainingQuota !== null && gift.remainingQuota === 0;
                      const firstImageRaw = gift.images && gift.images.length > 0 
                        ? gift.images.sort((a, b) => a.sortOrder - b.sortOrder)[0].imageUrl 
                        : gift.imageUrl;
                      
                      const firstImage = firstImageRaw?.startsWith('/api/') || firstImageRaw?.startsWith('/attached_assets/') 
                        ? firstImageRaw 
                        : `/api/uploads/${firstImageRaw}`;
                      
                      return (
                        <Card key={gift.id} className="overflow-hidden">
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={firstImage}
                              alt={gift.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardHeader>
                            <CardTitle className="text-lg">{gift.name}</CardTitle>
                            <CardDescription>{gift.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Quota badges */}
                            {gift.monthlyQuota !== null && gift.monthlyQuota !== undefined ? (
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" data-testid={`badge-quota-${gift.id}`}>
                                  โควต้ารายเดือน: {gift.monthlyQuota}
                                </Badge>
                                <Badge variant="outline" data-testid={`badge-used-${gift.id}`}>
                                  ใช้ไปแล้ว: {gift.usedThisMonth}
                                </Badge>
                                <Badge 
                                  variant={gift.remainingQuota! > 0 ? "default" : "destructive"}
                                  data-testid={`badge-remaining-${gift.id}`}
                                >
                                  เหลือ: {gift.remainingQuota}
                                </Badge>
                              </div>
                            ) : (
                              <Badge variant="secondary" data-testid={`badge-unlimited-${gift.id}`}>
                                ไม่จำกัดจำนวน
                              </Badge>
                            )}
                            
                            <div className="text-sm text-muted-foreground whitespace-pre-line">
                              {gift.details}
                            </div>
                            
                            <Button
                              className="w-full"
                              disabled={hasClaimedGift || !gift.active || isQuotaDepleted}
                              onClick={() => handleGiftSelect(gift.id)}
                              data-testid={`button-select-gift-${gift.id}`}
                            >
                              {hasClaimedGift ? "เลือกแล้ว" : isQuotaDepleted ? "หมดโควต้า" : "เลือกของขวัญนี้"}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="space-y-6">
              {/* Review Submission Form */}
              <Card>
                <CardHeader>
                  <CardTitle>รีวิวของคุณมีค่ากับเรามาก</CardTitle>
                  <CardDescription>โปรดแชร์ประสบการณ์ของคุณ เพื่อให้คนอื่นรู้ว่าการเข้าร่วมงานเป็นอย่างไร และช่วยให้เราทราบว่าควรปรับปรุงอย่างไรเพื่อให้บริการคุณได้ดียิ่งขึ้น ขอบคุณครับ</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <Label>ดาว *</Label>
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setReviewRating(rating)}
                            className="focus:outline-none"
                            data-testid={`button-rating-${rating}`}
                          >
                            <Star
                              className={`h-8 w-8 ${
                                rating <= reviewRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="review-title">หากจะบอกเพื่อนสั้น ๆ เกี่ยวกับงานไลฟ์นี้ คุณจะพูดอะไร? *</Label>
                      <Input
                        id="review-title"
                        value={reviewData.title}
                        onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                        required
                        data-testid="input-review-title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="review-content">โปรดเขียนรีวิว หรือ แชร์ประสบการณ์เพิ่มเติม *</Label>
                      <Textarea
                        id="review-content"
                        value={reviewData.content}
                        onChange={(e) => setReviewData({ ...reviewData, content: e.target.value })}
                        rows={4}
                        required
                        data-testid="textarea-review-content"
                      />
                    </div>

                    <div>
                      <Label htmlFor="review-pros">สิ่งที่ประทับใจที่สุด</Label>
                      <Textarea
                        id="review-pros"
                        value={reviewData.pros}
                        onChange={(e) => setReviewData({ ...reviewData, pros: e.target.value })}
                        rows={2}
                        data-testid="textarea-review-pros"
                      />
                    </div>

                    <div>
                      <Label htmlFor="review-cons">สิ่งที่อยากให้ปรับปรุงหรือเพิ่มเติม</Label>
                      <Textarea
                        id="review-cons"
                        value={reviewData.cons}
                        onChange={(e) => setReviewData({ ...reviewData, cons: e.target.value })}
                        rows={2}
                        data-testid="textarea-review-cons"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={reviewMutation.isPending}
                      data-testid="button-submit-review"
                    >
                      ส่งรีวิว
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Approved Reviews - Hidden as requested */}
              {false && <Card>
                <CardHeader>
                  <CardTitle>รีวิวจากสมาชิก</CardTitle>
                  <CardDescription>รีวิวที่ได้รับการอนุมัติแล้ว</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <h4 className="font-semibold">{review.title}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('th-TH')}
                            </p>
                          </div>

                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {review.content}
                          </p>

                          {(review.pros || review.cons) && (
                            <div className="grid md:grid-cols-2 gap-4 pt-2">
                              {review.pros && (
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-green-700 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    จุดเด่น
                                  </p>
                                  <p className="text-sm text-muted-foreground">{review.pros}</p>
                                </div>
                              )}
                              {review.cons && (
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-orange-700 flex items-center gap-1">
                                    <XCircle className="h-3 w-3" />
                                    จุดที่ควรปรับปรุง
                                  </p>
                                  <p className="text-sm text-muted-foreground">{review.cons}</p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4 pt-2 border-t">
                            <p className="text-sm text-muted-foreground">รีวิวนี้เป็นประโยชน์หรือไม่?</p>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => reviewHelpfulMutation.mutate({ reviewId: review.id, helpful: true })}
                                data-testid={`button-helpful-${review.id}`}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                เป็นประโยชน์ ({review.helpful})
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => reviewHelpfulMutation.mutate({ reviewId: review.id, helpful: false })}
                                data-testid={`button-not-helpful-${review.id}`}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1 rotate-180" />
                                ไม่เป็นประโยชน์ ({review.notHelpful})
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {reviews.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        ยังไม่มีรีวิว
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Gift Delivery Dialog */}
      <Dialog open={showDeliveryForm} onOpenChange={setShowDeliveryForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>กรอกข้อมูลการจัดส่ง</DialogTitle>
            <DialogDescription>
              กรุณากรอกข้อมูลสำหรับการจัดส่งของขวัญ
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDeliverySubmit} className="space-y-4">
            <div>
              <Label htmlFor="delivery-date">วันที่ต้องการรับ *</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={isDateDisabled}
                className="rounded-md border mt-2"
              />
              {dateAvailability && (
                <p className={`text-sm mt-2 ${dateAvailability.available ? "text-green-600" : "text-red-600"}`}>
                  {dateAvailability.available ? <CheckCircle className="inline h-4 w-4 mr-1" /> : <XCircle className="inline h-4 w-4 mr-1" />}
                  {dateAvailability.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="delivery-name">ชื่อผู้รับ *</Label>
              <Input
                id="delivery-name"
                value={deliveryData.deliveryName}
                onChange={(e) => setDeliveryData({ ...deliveryData, deliveryName: e.target.value })}
                required
                data-testid="input-delivery-name"
              />
            </div>

            <div>
              <Label htmlFor="delivery-phone">เบอร์โทรผู้รับ *</Label>
              <Input
                id="delivery-phone"
                type="tel"
                value={deliveryData.deliveryPhone}
                onChange={(e) => setDeliveryData({ ...deliveryData, deliveryPhone: e.target.value })}
                required
                data-testid="input-delivery-phone"
              />
            </div>

            <div>
              <Label htmlFor="house-number">บ้านเลขที่ *</Label>
              <Input
                id="house-number"
                value={deliveryData.houseNumber}
                onChange={(e) => setDeliveryData({ ...deliveryData, houseNumber: e.target.value })}
                required
                placeholder="เช่น 123"
                data-testid="input-house-number"
              />
            </div>

            <div>
              <Label htmlFor="moo-soi">หมู่/ซอย</Label>
              <Input
                id="moo-soi"
                value={deliveryData.mooSoi}
                onChange={(e) => setDeliveryData({ ...deliveryData, mooSoi: e.target.value })}
                placeholder="เช่น หมู่ 5 ซอยสุขุมวิท 21"
                data-testid="input-moo-soi"
              />
            </div>

            <div>
              <Label htmlFor="street">ถนน</Label>
              <Input
                id="street"
                value={deliveryData.street}
                onChange={(e) => setDeliveryData({ ...deliveryData, street: e.target.value })}
                placeholder="เช่น ถนนสุขุมวิท"
                data-testid="input-street"
              />
            </div>

            <div>
              <Label htmlFor="subdistrict">แขวง/ตำบล *</Label>
              <Input
                id="subdistrict"
                value={deliveryData.subdistrict}
                onChange={(e) => setDeliveryData({ ...deliveryData, subdistrict: e.target.value })}
                required
                placeholder="เช่น คลองเตย"
                data-testid="input-subdistrict"
              />
            </div>

            <div>
              <Label htmlFor="district">เขต/อำเภอ *</Label>
              <Input
                id="district"
                value={deliveryData.district}
                onChange={(e) => setDeliveryData({ ...deliveryData, district: e.target.value })}
                required
                placeholder="เช่น คลองเตย"
                data-testid="input-district"
              />
            </div>

            <div>
              <Label htmlFor="province">จังหวัด *</Label>
              <Input
                id="province"
                value={deliveryData.province}
                onChange={(e) => setDeliveryData({ ...deliveryData, province: e.target.value })}
                required
                placeholder="เช่น กรุงเทพมหานคร"
                data-testid="input-province"
              />
            </div>

            <div>
              <Label htmlFor="postal-code">เลขไปรษณีย์ *</Label>
              <Input
                id="postal-code"
                value={deliveryData.postalCode}
                onChange={(e) => setDeliveryData({ ...deliveryData, postalCode: e.target.value })}
                required
                placeholder="เช่น 10110"
                maxLength={5}
                pattern="\d{5}"
                data-testid="input-postal-code"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeliveryForm(false)}
                data-testid="button-cancel-delivery"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={giftDeliveryMutation.isPending || !selectedDate || !dateAvailability?.available}
                data-testid="button-confirm-delivery"
              >
                ยืนยันการเลือกของขวัญ
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Profile Edit Dialog */}
      <Dialog open={showProfileEdit} onOpenChange={setShowProfileEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลส่วนตัว</DialogTitle>
            <DialogDescription>
              อัพเดทข้อมูลส่วนตัวของคุณ
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <Label htmlFor="profile-prefix">คำนำหน้า *</Label>
              <Select
                value={profileData.prefix}
                onValueChange={(value) => setProfileData({ ...profileData, prefix: value })}
              >
                <SelectTrigger data-testid="select-profile-prefix">
                  <SelectValue placeholder="เลือกคำนำหน้า" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="นาย">นาย</SelectItem>
                  <SelectItem value="นาง">นาง</SelectItem>
                  <SelectItem value="นางสาว">นางสาว</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="profile-name">ชื่อ-นามสกุล *</Label>
              <Input
                id="profile-name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
                data-testid="input-profile-name"
              />
            </div>

            <div>
              <Label htmlFor="profile-phone">เบอร์โทรศัพท์ *</Label>
              <Input
                id="profile-phone"
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                required
                data-testid="input-profile-phone"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProfileEdit(false)}
                data-testid="button-cancel-profile"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                data-testid="button-save-profile"
              >
                บันทึก
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
