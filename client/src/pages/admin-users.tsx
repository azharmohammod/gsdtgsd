import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Key, Copy, CheckCircle2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Member, Payment } from "@shared/schema";

const statusColors = {
  approved: { label: "อนุมัติแล้ว", variant: "default" as const, class: "bg-green-600" },
  pending_payment: { label: "รอชำระเงิน", variant: "secondary" as const, class: "bg-orange-500" },
  pending_approval: { label: "รอการอนุมัติ", variant: "secondary" as const, class: "bg-yellow-500" },
  disapproved: { label: "ไม่อนุมัติ", variant: "destructive" as const, class: "" },
};

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<Member | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<Member | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingMember, setEditingMember] = useState<Partial<Member>>({});
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { toast } = useToast();

  // Fetch all members
  const { data: members = [], isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ["/api/admin/members"],
  });

  // Fetch all payments
  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/admin/payments"],
  });

  // Update member mutation
  const updateMemberMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Member> }) => {
      return apiRequest("PUT", `/api/admin/members/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
      toast({
        title: "บันทึกสำเร็จ",
        description: "อัพเดทข้อมูลสมาชิกเรียบร้อยแล้ว",
      });
      setShowViewDialog(false);
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทข้อมูลได้",
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/members/${id}/reset-password`);
      return res.json() as Promise<{ newPassword: string }>;
    },
    onSuccess: (data: { newPassword: string }) => {
      setGeneratedPassword(data.newPassword);
      setNewPassword(data.newPassword);
      toast({
        title: "รีเซ็ตรหัสผ่านสำเร็จ",
        description: "สร้างรหัสผ่านชั่วคราวใหม่แล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถรีเซ็ตรหัสผ่านได้",
        variant: "destructive",
      });
    },
  });

  // Verify payment mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "verified" | "rejected" }) => {
      return apiRequest("PUT", `/api/admin/payments/${id}/verify`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
      toast({
        title: "ตรวจสอบการชำระเงินสำเร็จ",
        description: "อัพเดทสถานะการชำระเงินเรียบร้อยแล้ว",
      });
      setShowPaymentDialog(false);
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถตรวจสอบการชำระเงินได้",
        variant: "destructive",
      });
    },
  });

  const handleResetPassword = () => {
    if (!resetPasswordUser) return;
    resetPasswordMutation.mutate(resetPasswordUser.id);
  };

  const handleSaveUserChanges = () => {
    if (!selectedUser) return;
    updateMemberMutation.mutate({
      id: selectedUser.id,
      data: editingMember,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "คัดลอกแล้ว",
      description: "คัดลอกรหัสผ่านไปยังคลิปบอร์ดแล้ว",
    });
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getMemberPayments = (memberId: string) => {
    return payments.filter((p) => p.memberId === memberId);
  };

  if (membersLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">จัดการผู้ใช้งาน</h1>
        <p className="text-muted-foreground">ดูและแก้ไขข้อมูลสมาชิกทั้งหมด</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <CardTitle>รายชื่อสมาชิก</CardTitle>
              <CardDescription>ทั้งหมด {filteredMembers.length} คน</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาด้วยชื่อ, เบอร์โทร..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-users"
            />
          </div>

          {/* Status Tabs */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" data-testid="tab-all">ทั้งหมด</TabsTrigger>
              <TabsTrigger value="pending_payment" data-testid="tab-pending-payment">รอชำระเงิน</TabsTrigger>
              <TabsTrigger value="pending_approval" data-testid="tab-pending-approval">รอการอนุมัติ</TabsTrigger>
              <TabsTrigger value="approved" data-testid="tab-approved">อนุมัติแล้ว</TabsTrigger>
              <TabsTrigger value="disapproved" data-testid="tab-disapproved">ไม่อนุมัติ</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Users Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เบอร์โทร</TableHead>
                  <TableHead>คำนำหน้า</TableHead>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>วันหมดอายุ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      ไม่พบสมาชิก
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.phone}</TableCell>
                      <TableCell>{member.prefix}</TableCell>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[member.status as keyof typeof statusColors]?.class || ""}>
                          {statusColors[member.status as keyof typeof statusColors]?.label || member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {member.membershipEnd
                          ? new Date(member.membershipEnd).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(member);
                              setEditingMember(member);
                              setShowViewDialog(true);
                            }}
                            data-testid={`button-view-user-${member.id}`}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            ดูรายละเอียด
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View/Edit User Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รายละเอียดสมาชิก</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลและจัดการสมาชิก</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>เบอร์โทร</Label>
                  <Input value={selectedUser.phone} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>วันที่สมัคร</Label>
                  <Input
                    value={new Date(selectedUser.createdAt).toLocaleDateString("th-TH")}
                    readOnly
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>คำนำหน้า</Label>
                  <Select
                    value={editingMember.prefix || selectedUser.prefix}
                    onValueChange={(value) => setEditingMember({ ...editingMember, prefix: value })}
                  >
                    <SelectTrigger data-testid="select-prefix">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="นาย">นาย</SelectItem>
                      <SelectItem value="นาง">นาง</SelectItem>
                      <SelectItem value="นางสาว">นางสาว</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>ชื่อ-นามสกุล</Label>
                  <Input
                    value={editingMember.name || selectedUser.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    data-testid="input-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>รหัสผ่าน</Label>
                <div className="flex gap-2">
                  <Input type="text" value="••••••••••" readOnly className="flex-1" />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setResetPasswordUser(selectedUser);
                      setShowResetDialog(true);
                    }}
                    data-testid="button-reset-password"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    รีเซ็ตรหัสผ่าน
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>สถานะ</Label>
                  <Select
                    value={editingMember.status || selectedUser.status}
                    onValueChange={(value) => setEditingMember({ ...editingMember, status: value })}
                  >
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                      <SelectItem value="pending_payment">รอชำระเงิน</SelectItem>
                      <SelectItem value="pending_approval">รอการอนุมัติ</SelectItem>
                      <SelectItem value="disapproved">ไม่อนุมัติ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>วันหมดอายุ</Label>
                  <Input
                    type="date"
                    value={
                      editingMember.membershipEnd
                        ? new Date(editingMember.membershipEnd).toISOString().split("T")[0]
                        : selectedUser.membershipEnd
                        ? new Date(selectedUser.membershipEnd).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        membershipEnd: new Date(e.target.value),
                      })
                    }
                    data-testid="input-membership-end"
                  />
                </div>
              </div>

              {/* Payments Section */}
              <div className="space-y-2 pt-4 border-t">
                <Label>ประวัติการชำระเงิน</Label>
                {getMemberPayments(selectedUser.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">ยังไม่มีการชำระเงิน</p>
                ) : (
                  <div className="space-y-2">
                    {getMemberPayments(selectedUser.id).map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            ฿{payment.amount} -{" "}
                            {new Date(payment.createdAt).toLocaleDateString("th-TH")}
                          </p>
                          <Badge
                            variant={
                              payment.status === "verified"
                                ? "default"
                                : payment.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {payment.status === "verified"
                              ? "ตรวจสอบแล้ว"
                              : payment.status === "rejected"
                              ? "ปฏิเสธ"
                              : "รอตรวจสอบ"}
                          </Badge>
                        </div>
                        {payment.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowPaymentDialog(true);
                            }}
                            data-testid={`button-verify-payment-${payment.id}`}
                          >
                            ตรวจสอบ
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowViewDialog(false)}
                  data-testid="button-cancel-edit"
                >
                  ยกเลิก
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSaveUserChanges}
                  disabled={updateMemberMutation.isPending}
                  data-testid="button-save-user"
                >
                  {updateMemberMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  บันทึกการเปลี่ยนแปลง
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Verification Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ตรวจสอบการชำระเงิน</DialogTitle>
            <DialogDescription>ตรวจสอบและอนุมัติการชำระเงิน</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>จำนวนเงิน</Label>
                <Input value={`฿${selectedPayment.amount}`} readOnly />
              </div>
              <div className="space-y-2">
                <Label>วันที่ชำระ</Label>
                <Input
                  value={new Date(selectedPayment.createdAt).toLocaleDateString("th-TH")}
                  readOnly
                />
              </div>
              {selectedPayment.slipUrl && (
                <div className="space-y-2">
                  <Label>สลิปการชำระเงิน</Label>
                  <img
                    src={`/api/payment-slips/${selectedPayment.slipUrl.split('/').pop()}`}
                    alt="Payment slip"
                    className="w-full max-w-xs rounded-lg border"
                    data-testid="img-payment-slip"
                  />
                </div>
              )}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    verifyPaymentMutation.mutate({
                      id: selectedPayment.id,
                      status: "rejected",
                    })
                  }
                  disabled={verifyPaymentMutation.isPending}
                  data-testid="button-reject-payment"
                >
                  ปฏิเสธ
                </Button>
                <Button
                  className="flex-1"
                  onClick={() =>
                    verifyPaymentMutation.mutate({
                      id: selectedPayment.id,
                      status: "verified",
                    })
                  }
                  disabled={verifyPaymentMutation.isPending}
                  data-testid="button-verify-payment"
                >
                  {verifyPaymentMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  ตรวจสอบและอนุมัติ
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>รีเซ็ตรหัสผ่าน</DialogTitle>
            <DialogDescription>
              สร้างรหัสผ่านชั่วคราวใหม่สำหรับ {resetPasswordUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!generatedPassword ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  คลิกปุ่มด้านล่างเพื่อสุ่มรหัสผ่านใหม่
                </p>
                <Button
                  onClick={handleResetPassword}
                  disabled={resetPasswordMutation.isPending}
                  className="w-full"
                  data-testid="button-generate-password"
                >
                  {resetPasswordMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  สุ่มรหัสผ่าน
                </Button>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">รหัสผ่านที่สุ่มขึ้น</p>
                    <p className="font-mono font-semibold text-sm break-all">
                      {generatedPassword}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedPassword)}
                    data-testid="button-copy-password"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs space-y-1">
                  <p className="font-medium text-blue-900 dark:text-blue-100">วิธีใช้งาน:</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                    <li>คลิก "สุ่มรหัสผ่าน" เพื่อสร้างรหัสผ่านอัตโนมัติ</li>
                    <li>คัดลอกรหัสผ่านและส่งให้สมาชิกผ่านทาง Line หรือช่องทางอื่น</li>
                    <li>แจ้งสมาชิกให้เปลี่ยนรหัสผ่านหลังจากเข้าสู่ระบบ</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowResetDialog(false);
                  setNewPassword("");
                  setGeneratedPassword("");
                }}
                className="flex-1"
                data-testid="button-cancel-reset"
              >
                ปิด
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
