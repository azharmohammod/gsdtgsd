import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, RefreshCw, Sparkles, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Member } from "@shared/schema";

export default function ThankYouPage() {
  const [, setLocation] = useLocation();
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch current member data from backend API
  const { data: member, isLoading, error, refetch, isFetching } = useQuery<Member>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (error) {
      const errorMessage = error.message || '';
      if (errorMessage.includes('401')) {
        setLocation("/login");
      }
    }
  }, [error, setLocation]);

  // Show confetti animation when approved
  useEffect(() => {
    if (member?.status === 'approved') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [member?.status]);

  const handleRefresh = () => {
    refetch();
  };

  const handleContinue = () => {
    setLocation("/member");
  };

  // Show loading state
  if (isLoading) {
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
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-10 w-96 mx-auto mb-2" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>
          <Skeleton className="h-64 w-full mb-6" />
        </main>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  const isApproved = member.status === 'approved';

  return (
    <div className="min-h-screen bg-background relative">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-bounce">
            <Sparkles className="h-24 w-24 text-yellow-500" />
          </div>
        </div>
      )}

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

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className={`inline-flex h-16 w-16 items-center justify-center rounded-full mb-4 ${
            isApproved ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
          }`}>
            {isApproved ? (
              <CheckCircle2 className="h-8 w-8" />
            ) : (
              <Clock className="h-8 w-8" />
            )}
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {isApproved ? "ยินดีต้อนรับสู่สมาชิก!" : "ขอบคุณที่ส่งหลักฐานการชำระเงิน"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {isApproved 
              ? "การชำระเงินของคุณได้รับการยืนยันแล้ว" 
              : "กรุณารอแอดมินตรวจสอบการชำระเงินของคุณ"
            }
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">สถานะการอนุมัติ</CardTitle>
              <Badge 
                variant={isApproved ? "default" : "secondary"}
                className={isApproved ? "bg-green-600" : ""}
                data-testid="badge-status"
              >
                {isApproved ? "อนุมัติแล้ว" : "กำลังรอการอนุมัติ"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isApproved ? (
              <>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium mb-1">รอการตรวจสอบ</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        แอดมินกำลังตรวจสอบหลักฐานการชำระเงินของคุณ 
                        ระยะเวลาอนุมัติโดยประมาณ 1-2 ชั่วโมง
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleRefresh}
                  disabled={isFetching}
                  data-testid="button-refresh"
                >
                  {isFetching ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      กำลังตรวจสอบ...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      รีเฟรชสถานะ
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-green-900 mb-2">
                    การชำระเงินได้รับการยืนยันแล้ว!
                  </h3>
                  <p className="text-green-700 leading-relaxed">
                    คุณสามารถเข้าถึงพื้นที่สมาชิกและเข้าร่วมกิจกรรมไลฟ์ได้แล้ว
                  </p>
                </div>

                <Button
                  className="w-full h-12"
                  onClick={handleContinue}
                  data-testid="button-continue"
                >
                  เข้าสู่พื้นที่สมาชิก
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <h3 className="font-semibold mb-2">ต้องการความช่วยเหลือ?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  หากมีคำถามหรือต้องการสอบถามสถานะการชำระเงิน ติดต่อเราผ่าน Line
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
      </main>
    </div>
  );
}
