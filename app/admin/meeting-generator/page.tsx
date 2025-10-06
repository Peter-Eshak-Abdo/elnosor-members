"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, CheckCircle, AlertCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/app/providers";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { createSampleMeetings, createSingleMeeting, MeetingData } from "@/lib/meeting-generator";
import { useAttendance, firestoreHelpers } from "@/hooks/use-firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";

export default function MeetingGeneratorPage() {
  const { user, role } = useAuth();
  const { meetings } = useAttendance();
  const [loading, setLoading] = useState(false);
  const [generatedMeetings, setGeneratedMeetings] = useState<any[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    type: "regular",
    status: "scheduled",
  });

  const [singleMeetingForm, setSingleMeetingForm] = useState<MeetingData>({
    title: "اجتماع مخصص",
    description: "اجتماع مخصص للخدام والمخدومين",
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    location: "قاعة الاجتماعات الرئيسية",
    type: "regular",
    status: "scheduled",
  });

  const handleGenerateMeetings = async (months: number = 3) => {
    if (role !== "admin") {
      toast.error("يجب أن تكون مديراً لإنشاء الاجتماعات");
      return;
    }

    setLoading(true);
    try {
      const meetings = await createSampleMeetings(months);
      setGeneratedMeetings(meetings);
      toast.success(`تم إنشاء ${meetings.length} اجتماع بنجاح!`);
    } catch (error) {
      console.error("Error generating meetings:", error);
      toast.error("خطأ في إنشاء الاجتماعات");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSingleMeeting = async () => {
    if (role !== "admin") {
      toast.error("يجب أن تكون مديراً لإنشاء الاجتماعات");
      return;
    }

    setLoading(true);
    try {
      const meeting = await createSingleMeeting(singleMeetingForm);
      setGeneratedMeetings((prev) => [...prev, meeting]);
      toast.success("تم إنشاء الاجتماع المخصص بنجاح!");
    } catch (error) {
      console.error("Error generating single meeting:", error);
      toast.error("خطأ في إنشاء الاجتماع المخصص");
    } finally {
      setLoading(false);
    }
  };

  const handleEditMeeting = (meeting: any) => {
    setEditingMeeting(meeting);
    setEditForm({
      title: meeting.title,
      description: meeting.description,
      date: meeting.date.toLocaleDateString('en-CA'),
      startTime: meeting.startTime.toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(' ', 'T'),
      endTime: meeting.endTime.toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(' ', 'T'),
      location: meeting.location,
      type: meeting.type,
      status: meeting.status,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMeeting) return;

    try {
      await firestoreHelpers.updateMeeting(editingMeeting.id, {
        title: editForm.title,
        description: editForm.description,
        date: new Date(editForm.date),
        startTime: new Date(editForm.startTime),
        endTime: new Date(editForm.endTime),
        location: editForm.location,
        type: editForm.type as "regular" | "special" | "training",
        status: editForm.status as "scheduled" | "completed" | "cancelled",
      });
      toast.success("تم تحديث الاجتماع بنجاح");
      setEditDialogOpen(false);
      setEditingMeeting(null);
    } catch (error) {
      console.error("Error updating meeting:", error);
      toast.error("خطأ في تحديث الاجتماع");
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الاجتماع؟")) return;

    try {
      await firestoreHelpers.deleteMeeting(meetingId);
      toast.success("تم حذف الاجتماع بنجاح");
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast.error("خطأ في حذف الاجتماع");
    }
  };

  if (role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card glassy className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">غير مصرح لك</h2>
            <p className="text-gray-600 dark:text-gray-400">
              يجب أن تكون مديراً للوصول إلى هذه الصفحة
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          إدارة الاجتماعات
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          إنشاء وتعديل اجتماعات الجمعة الأسبوعية
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Generate 1 Month */}
        <Card glassy>
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">شهر واحد</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              إنشاء اجتماعات الجمعة للشهر القادم
            </p>
            <Button
              onClick={() => handleGenerateMeetings(1)}
              disabled={loading}
              className="w-full"
            >
              {loading ? <LoadingSpinner size="sm" /> : <Plus className="w-4 h-4 ml-2" />}
              إنشاء لشهر واحد
            </Button>
          </CardContent>
        </Card>

        {/* Generate 3 Months */}
        <Card glassy>
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">3 أشهر</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              إنشاء اجتماعات الجمعة للـ 3 أشهر القادمة
            </p>
            <Button
              onClick={() => handleGenerateMeetings(3)}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? <LoadingSpinner size="sm" /> : <Plus className="w-4 h-4 ml-2" />}
              إنشاء لـ 3 أشهر
            </Button>
          </CardContent>
        </Card>

        {/* Generate 6 Months */}
        <Card glassy>
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">6 أشهر</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              إنشاء اجتماعات الجمعة للـ 6 أشهر القادمة
            </p>
            <Button
              onClick={() => handleGenerateMeetings(6)}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? <LoadingSpinner size="sm" /> : <Plus className="w-4 h-4 ml-2" />}
              إنشاء لـ 6 أشهر
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* New Single Meeting Generator */}
      <Card glassy>
        <CardHeader>
          <CardTitle>إنشاء اجتماع مخصص</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>عنوان الاجتماع</Label>
            <Input
              value={singleMeetingForm.title}
              onChange={(e) => setSingleMeetingForm({ ...singleMeetingForm, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>الوصف</Label>
            <Textarea
              value={singleMeetingForm.description}
              onChange={(e) => setSingleMeetingForm({ ...singleMeetingForm, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>التاريخ</Label>
            <Input
              type="date"
              value={singleMeetingForm.date.toISOString().split('T')[0]}
              onChange={(e) => {
                const newDate = new Date(singleMeetingForm.date);
                const [year, month, day] = e.target.value.split('-').map(Number);
                newDate.setFullYear(year, month - 1, day);
                setSingleMeetingForm({ ...singleMeetingForm, date: newDate });
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>وقت البدء</Label>
              <Input
                type="time"
                value={singleMeetingForm.startTime.toTimeString().slice(0, 5)}
                onChange={(e) => {
                  const newStart = new Date(singleMeetingForm.startTime);
                  const [hours, minutes] = e.target.value.split(':').map(Number);
                  newStart.setHours(hours, minutes);
                  setSingleMeetingForm({ ...singleMeetingForm, startTime: newStart });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>وقت الانتهاء</Label>
              <Input
                type="time"
                value={singleMeetingForm.endTime.toTimeString().slice(0, 5)}
                onChange={(e) => {
                  const newEnd = new Date(singleMeetingForm.endTime);
                  const [hours, minutes] = e.target.value.split(':').map(Number);
                  newEnd.setHours(hours, minutes);
                  setSingleMeetingForm({ ...singleMeetingForm, endTime: newEnd });
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>المكان</Label>
            <Input
              value={singleMeetingForm.location}
              onChange={(e) => setSingleMeetingForm({ ...singleMeetingForm, location: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>النوع</Label>
            <Select
              value={singleMeetingForm.type}
              onValueChange={(value) =>
                setSingleMeetingForm({ ...singleMeetingForm, type: value as "regular" | "special" | "training" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">عادي</SelectItem>
                <SelectItem value="special">خاص</SelectItem>
                <SelectItem value="training">تدريب</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>الحالة</Label>
            <Select
              value={singleMeetingForm.status}
              onValueChange={(value) =>
                setSingleMeetingForm({ ...singleMeetingForm, status: value as "scheduled" | "completed" | "cancelled" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">مجدول</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerateSingleMeeting} disabled={loading} className="w-full">
            {loading ? <LoadingSpinner size="sm" /> : <Plus className="w-4 h-4 ml-2" />}
            إنشاء اجتماع مخصص
          </Button>
        </CardContent>
      </Card>

      {/* Generated Meetings List */}
      {generatedMeetings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card glassy>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                الاجتماعات المُنشأة ({generatedMeetings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {generatedMeetings.map((meeting, index) => (
                  <div
                    key={meeting.id || index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{meeting.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(meeting.date).toLocaleDateString('ar-EG')} - {new Date(meeting.startTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      تم الإنشاء
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Manage Existing Meetings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card glassy>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              إدارة الاجتماعات الموجودة ({meetings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{meeting.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {meeting.date.toLocaleDateString('ar-EG')} - {meeting.startTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        📍 {meeting.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={meeting.status === 'scheduled' ? 'default' : meeting.status === 'completed' ? 'secondary' : 'destructive'}>
                      {meeting.status === 'scheduled' ? 'مجدول' : meeting.status === 'completed' ? 'مكتمل' : 'ملغي'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMeeting(meeting)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMeeting(meeting.id!)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {meetings.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">لا توجد اجتماعات</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Instructions */}
      <Card glassy>
        <CardHeader>
          <CardTitle>كيفية الاستخدام</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
              1
            </div>
            <div>
              <p className="font-medium">اختر الفترة الزمنية</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                اختر عدد الأشهر التي تريد إنشاء اجتماعات الجمعة لها
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
              2
            </div>
            <div>
              <p className="font-medium">انقر على زر الإنشاء</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                سيتم إنشاء جميع اجتماعات الجمعة للفترة المحددة تلقائياً
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
              3
            </div>
            <div>
              <p className="font-medium">إدارة الاجتماعات</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                يمكنك تعديل أو حذف أي اجتماع موجود من قائمة الإدارة
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Meeting Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الاجتماع</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>عنوان الاجتماع</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>وقت البدء</Label>
                <Input
                  type="datetime-local"
                  value={editForm.startTime}
                  onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>وقت الانتهاء</Label>
                <Input
                  type="datetime-local"
                  value={editForm.endTime}
                  onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>المكان</Label>
              <Input
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>النوع</Label>
              <Select
                value={editForm.type}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">عادي</SelectItem>
                  <SelectItem value="special">خاص</SelectItem>
                  <SelectItem value="training">تدريب</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select
                value={editForm.status}
                onValueChange={(value: "scheduled" | "completed" | "cancelled") =>
                  setEditForm({ ...editForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">مجدول</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSaveEdit}>
                حفظ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
