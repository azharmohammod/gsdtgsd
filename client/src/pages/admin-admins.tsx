import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Admin } from "@shared/schema";

export default function AdminAdmins() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<Admin | null>(null);
  const { toast } = useToast();

  // Fetch all admins
  const { data: admins = [], isLoading } = useQuery<Admin[]>({
    queryKey: ["/api/admin/admins"],
  });

  // Create admin mutation
  const createAdminMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      return apiRequest("POST", "/api/admin/admins", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      toast({
        title: "สร้างแอดมินสำเร็จ",
        description: "เพิ่มบัญชีแอดมินใหม่เรียบร้อยแล้ว",
      });
      setShowCreateDialog(false);
      setNewUsername("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถสร้างบัญชีแอดมินได้",
        variant: "destructive",
      });
    },
  });

  // Delete admin mutation
  const deleteAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/admins/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      toast({
        title: "ลบแอดมินสำเร็จ",
        description: "ลบบัญชีแอดมินเรียบร้อยแล้ว",
      });
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบบัญชีแอดมินได้",
        variant: "destructive",
      });
    },
  });

  const handleCreateAdmin = () => {
    if (!newUsername || !newPassword || !confirmPassword) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        description: "โปรดกรอก Username และ Password ทั้งสองช่อง",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "รหัสผ่านไม่ตรงกัน",
        description: "กรุณากรอกรหัสผ่านให้ตรงกันทั้งสองช่อง",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "รหัสผ่านสั้นเกินไป",
        description: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
        variant: "destructive",
      });
      return;
    }

    createAdminMutation.mutate({
      username: newUsername,
      password: newPassword,
    });
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
        <h1 className="text-3xl font-bold">จัดการแอดมิน</h1>
        <p className="text-muted-foreground">สร้างและจัดการบัญชีแอดมินทั้งหมด</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <CardTitle>บัญชีแอดมิน</CardTitle>
              <CardDescription>ทั้งหมด {admins.length} บัญชี</CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              data-testid="button-create-admin"
            >
              <Plus className="h-4 w-4 mr-2" />
              สร้างแอดมินใหม่
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>วันที่สร้าง</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      ไม่พบบัญชีแอดมิน
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-blue-600" />
                          {admin.username}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(admin.createdAt).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirm(admin)}
                          data-testid={`button-delete-admin-${admin.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          ลบ
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Admin Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>สร้างบัญชีแอดมินใหม่</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลเพื่อสร้างบัญชีแอดมินใหม่
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="กรอก Username"
                data-testid="input-admin-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
                data-testid="input-admin-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">ยืนยัน Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                data-testid="input-admin-confirm-password"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCreateDialog(false)}
                data-testid="button-cancel-create"
              >
                ยกเลิก
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateAdmin}
                disabled={createAdminMutation.isPending}
                data-testid="button-submit-create"
              >
                {createAdminMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                สร้างแอดมิน
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบบัญชีแอดมิน?</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบบัญชี <strong>{deleteConfirm?.username}</strong> ใช่หรือไม่?
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteAdminMutation.mutate(deleteConfirm.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteAdminMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
