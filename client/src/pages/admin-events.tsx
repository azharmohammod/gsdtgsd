import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar, Video, Edit, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Event } from "@shared/schema";
import { datetimeLocalToSql, sqlTimestampToDatetimeLocal, sqlTimestampToDate, getBangkokNow } from "@/lib/datetime";

const platformOptions = [
  { value: "zoom", label: "Zoom", icon: "📹" },
  { value: "vimeo", label: "Vimeo", icon: "🎬" },
];

export default function AdminEvents() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    eventDate: "",
    platform: "zoom",
    eventUrl: "",
    replayUrl: "",
    active: true,
  });
  const { toast } = useToast();

  // Fetch all events
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/admin/events"],
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: typeof eventData) => {
      if (!data.title || !data.eventDate || !data.platform || !data.eventUrl) {
        throw new Error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      }
      
      // Convert datetime-local to SQL timestamp format (no UTC conversion)
      const sqlTimestamp = datetimeLocalToSql(data.eventDate);
      
      return apiRequest("POST", "/api/admin/events", {
        title: data.title,
        description: data.description || "",
        eventDate: sqlTimestamp,
        platform: data.platform,
        eventUrl: data.eventUrl,
        replayUrl: data.replayUrl || "",
        active: data.active,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      toast({
        title: "สร้างกิจกรรมสำเร็จ",
        description: "เพิ่มกิจกรรมใหม่เรียบร้อยแล้ว",
      });
      setShowAddDialog(false);
      setEventData({
        title: "",
        description: "",
        eventDate: "",
        platform: "zoom",
        eventUrl: "",
        replayUrl: "",
        active: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถสร้างกิจกรรมได้",
        variant: "destructive",
      });
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof eventData }) => {
      if (!data.title || !data.eventDate || !data.platform || !data.eventUrl) {
        throw new Error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      }
      
      // Convert datetime-local to SQL timestamp format (no UTC conversion)
      const sqlTimestamp = datetimeLocalToSql(data.eventDate);
      
      return apiRequest("PUT", `/api/admin/events/${id}`, {
        title: data.title,
        description: data.description || "",
        eventDate: sqlTimestamp,
        platform: data.platform,
        eventUrl: data.eventUrl,
        replayUrl: data.replayUrl || "",
        active: data.active,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      toast({
        title: "อัพเดทกิจกรรมสำเร็จ",
        description: "บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว",
      });
      setShowEditDialog(false);
      setSelectedEvent(null);
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัพเดทกิจกรรมได้",
        variant: "destructive",
      });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      toast({
        title: "ลบกิจกรรมสำเร็จ",
        description: "ลบกิจกรรมออกจากระบบแล้ว",
      });
      setShowDeleteDialog(false);
      setSelectedEvent(null);
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบกิจกรรมได้",
        variant: "destructive",
      });
    },
  });

  const handleCreateEvent = () => {
    createEventMutation.mutate(eventData);
  };

  const handleUpdateEvent = () => {
    if (!selectedEvent) return;
    updateEventMutation.mutate({
      id: selectedEvent.id,
      data: eventData,
    });
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    deleteEventMutation.mutate(selectedEvent.id);
  };

  const handleEditClick = (event: Event) => {
    setSelectedEvent(event);
    // Convert from SQL timestamp or ISO format to datetime-local
    let datetimeLocal = "";
    if (typeof event.eventDate === "string") {
      if (event.eventDate.includes("T") && event.eventDate.includes("Z")) {
        // ISO format from old data - convert via Date
        datetimeLocal = new Date(event.eventDate).toISOString().slice(0, 16);
      } else {
        // SQL timestamp format - use helper
        datetimeLocal = sqlTimestampToDatetimeLocal(event.eventDate);
      }
    }
    
    setEventData({
      title: event.title,
      description: event.description || "",
      eventDate: datetimeLocal,
      platform: event.platform,
      eventUrl: event.eventUrl,
      replayUrl: event.replayUrl || "",
      active: event.active,
    });
    setShowEditDialog(true);
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
        <h1 className="text-3xl font-bold">กำหนดการกิจกรรม</h1>
        <p className="text-muted-foreground">จัดการกิจกรรมไลฟ์และ Webinar</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <CardTitle>รายการกิจกรรมทั้งหมด</CardTitle>
              <CardDescription>ทั้งหมด {events.length} กิจกรรม</CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-event">
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มกิจกรรมใหม่
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>เพิ่มกิจกรรมใหม่</DialogTitle>
                  <DialogDescription>กรอกรายละเอียดกิจกรรมไลฟ์</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-title">ชื่อกิจกรรม <span className="text-destructive">*</span></Label>
                    <Input
                      id="event-title"
                      placeholder="เช่น การทำสมาธิเพื่อสุขภาพจิต"
                      value={eventData.title}
                      onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                      data-testid="input-event-title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-datetime">วันที่และเวลา <span className="text-destructive">*</span></Label>
                    <Input
                      id="event-datetime"
                      type="datetime-local"
                      value={eventData.eventDate}
                      onChange={(e) => setEventData({ ...eventData, eventDate: e.target.value })}
                      data-testid="input-event-date"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-platform">แพลตฟอร์ม <span className="text-destructive">*</span></Label>
                    <Select
                      value={eventData.platform}
                      onValueChange={(value) => setEventData({ ...eventData, platform: value })}
                      required
                    >
                      <SelectTrigger data-testid="select-platform">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {platformOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.icon} {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-url">URL ลิงก์กิจกรรม <span className="text-destructive">*</span></Label>
                    <Input
                      id="event-url"
                      placeholder="https://zoom.us/j/... หรือ https://vimeo.com/event/..."
                      value={eventData.eventUrl}
                      onChange={(e) => setEventData({ ...eventData, eventUrl: e.target.value })}
                      data-testid="input-event-url"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="replay-url">URL ย้อนหลัง (ถ้ามี)</Label>
                    <Input
                      id="replay-url"
                      placeholder="https://..."
                      value={eventData.replayUrl}
                      onChange={(e) => setEventData({ ...eventData, replayUrl: e.target.value })}
                      data-testid="input-replay-url"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-details">รายละเอียด</Label>
                    <Textarea
                      id="event-details"
                      placeholder="รายละเอียดของกิจกรรม..."
                      rows={4}
                      value={eventData.description}
                      onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                      data-testid="textarea-event-details"
                    />
                  </div>
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowAddDialog(false)}
                      data-testid="button-cancel-event"
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleCreateEvent}
                      disabled={createEventMutation.isPending}
                      data-testid="button-save-event"
                    >
                      {createEventMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      บันทึกกิจกรรม
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">ยังไม่มีกิจกรรม</div>
            ) : (
              events.map((event) => {
                const isPast = sqlTimestampToDate(event.eventDate) < getBangkokNow();
                return (
                  <Card key={event.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{event.title}</h3>
                            <Badge variant={isPast ? "secondary" : "default"}>
                              {isPast ? "ผ่านไปแล้ว" : "กำลังมาถึง"}
                            </Badge>
                            {!event.active && <Badge variant="outline">ปิดใช้งาน</Badge>}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {sqlTimestampToDate(event.eventDate).toLocaleDateString("th-TH", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "Asia/Bangkok",
                              })}{" "}
                              น.
                            </div>
                            <div className="flex items-center gap-1">
                              <Video className="h-4 w-4" />
                              {platformOptions.find((p) => p.value === event.platform)?.label}
                            </div>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          )}
                          <div className="pt-2">
                            <Label className="text-xs">ลิงก์กิจกรรม:</Label>
                            <a
                              href={event.eventUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline break-all block"
                            >
                              {event.eventUrl}
                            </a>
                          </div>
                          {event.replayUrl && (
                            <div>
                              <Label className="text-xs">ลิงก์ย้อนหลัง:</Label>
                              <a
                                href={event.replayUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline break-all block"
                              >
                                {event.replayUrl}
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(event)}
                            data-testid={`button-edit-event-${event.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowDeleteDialog(true);
                            }}
                            data-testid={`button-delete-event-${event.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Event Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขกิจกรรม</DialogTitle>
            <DialogDescription>แก้ไขรายละเอียดกิจกรรม</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-event-title">ชื่อกิจกรรม <span className="text-destructive">*</span></Label>
              <Input
                id="edit-event-title"
                value={eventData.title}
                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                data-testid="input-edit-event-title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-event-datetime">วันที่และเวลา <span className="text-destructive">*</span></Label>
              <Input
                id="edit-event-datetime"
                type="datetime-local"
                value={eventData.eventDate}
                onChange={(e) => setEventData({ ...eventData, eventDate: e.target.value })}
                data-testid="input-edit-event-date"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-event-platform">แพลตฟอร์ม <span className="text-destructive">*</span></Label>
              <Select
                value={eventData.platform}
                onValueChange={(value) => setEventData({ ...eventData, platform: value })}
                required
              >
                <SelectTrigger data-testid="select-edit-platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-event-url">URL ลิงก์กิจกรรม <span className="text-destructive">*</span></Label>
              <Input
                id="edit-event-url"
                value={eventData.eventUrl}
                onChange={(e) => setEventData({ ...eventData, eventUrl: e.target.value })}
                data-testid="input-edit-event-url"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-replay-url">URL ย้อนหลัง (ถ้ามี)</Label>
              <Input
                id="edit-replay-url"
                value={eventData.replayUrl}
                onChange={(e) => setEventData({ ...eventData, replayUrl: e.target.value })}
                data-testid="input-edit-replay-url"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-event-details">รายละเอียด</Label>
              <Textarea
                id="edit-event-details"
                rows={4}
                value={eventData.description}
                onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                data-testid="textarea-edit-event-details"
              />
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEditDialog(false)}
                data-testid="button-cancel-edit-event"
              >
                ยกเลิก
              </Button>
              <Button
                className="flex-1"
                onClick={handleUpdateEvent}
                disabled={updateEventMutation.isPending}
                data-testid="button-save-edit-event"
              >
                {updateEventMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                บันทึกการเปลี่ยนแปลง
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบกิจกรรม</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบกิจกรรม "{selectedEvent?.title}" การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteEventMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              ลบกิจกรรม
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
