import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Event } from "@shared/schema";
import { sqlTimestampToDate, getBangkokNow } from "@/lib/datetime";

export default function LiveEventPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/live/:id");
  const eventId = params?.id || "";

  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch all events from API
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/member/events"],
  });

  // Find the specific event by ID
  const event = events.find(e => e.id === eventId);

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b py-4 px-4">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/member")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold text-foreground">สมาชิก</h1>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="w-full aspect-video mb-6" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </main>
      </div>
    );
  }

  // Show error if event not found
  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">ไม่พบกิจกรรมนี้</p>
            <Button className="mt-4" onClick={() => setLocation("/member")}>
              กลับสู่พื้นที่สมาชิก
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine if event is past
  const isPast = sqlTimestampToDate(event.eventDate) < getBangkokNow();

  // Use eventUrl for live/upcoming events, replayUrl for past events
  const embedUrl = isPast && event.replayUrl ? event.replayUrl : event.eventUrl;

  const handlePlayClick = () => {
    setIsPlaying(true);
    console.log("Starting live event:", eventId, event.platform);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b py-4 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/member")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">สมาชิก</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold">{event.title}</h2>
            <Badge variant={isPast ? "secondary" : "default"}>
              {isPast ? "ย้อนหลัง" : "ไลฟ์"}
            </Badge>
          </div>
          <p className="text-muted-foreground leading-relaxed">{event.description}</p>
        </div>

        {/* Video Player */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              {isPlaying || isPast ? (
                <iframe
                  src={embedUrl}
                  className="absolute top-0 left-0 w-full h-full rounded-t-lg"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={event.title}
                  data-testid="iframe-video"
                ></iframe>
              ) : (
                <div className="absolute top-0 left-0 w-full h-full bg-muted rounded-t-lg flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <Video className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">พร้อมที่จะเข้าร่วมแล้วหรือยัง?</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        คลิกปุ่มด้านล่างเพื่อเริ่มชมกิจกรรมไลฟ์
                      </p>
                      <Button size="lg" onClick={handlePlayClick} data-testid="button-start-live">
                        <Play className="mr-2 h-5 w-5" />
                        เริ่มชม
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">รายละเอียดกิจกรรม</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">วันที่และเวลา</p>
                <p className="font-medium">
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
              <div>
                <p className="text-sm text-muted-foreground">แพลตฟอร์ม</p>
                <p className="font-medium capitalize">{event.platform}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">ติดต่อเรา</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                หากมีปัญหาในการเข้าร่วมกิจกรรม ติดต่อเราได้ทันทีผ่าน Line
              </p>
              <Button 
                variant="outline" 
                className="w-full bg-[#06C755] text-white hover:bg-[#06C755]/90"
                data-testid="button-line-support"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"></path>
                </svg>
                ติดต่อผ่าน Line
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Missing Play icon import
function Play({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
