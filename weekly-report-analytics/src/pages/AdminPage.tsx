import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, FileSpreadsheet, AlertCircle, CheckCircle, Settings } from 'lucide-react';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  allowedSheets: string[];
  createdAt: any;
}

interface ReportSheet {
  sheetName: string;
  count: number;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [availableSheets, setAvailableSheets] = useState<ReportSheet[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load users
      const usersSnapshot = await getDocs(
        query(collection(db, 'users'), orderBy('email'))
      );
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);

      // Load available sheets from all reports
      const reportsSnapshot = await getDocs(collection(db, 'reports'));
      const sheetsMap = new Map<string, number>();
      
      reportsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.parsedData) {
          data.parsedData.forEach((sheet: any) => {
            const count = sheetsMap.get(sheet.sheetName) || 0;
            sheetsMap.set(sheet.sheetName, count + 1);
          });
        }
      });

      const sheets = Array.from(sheetsMap.entries())
        .map(([sheetName, count]) => ({ sheetName, count }))
        .sort((a, b) => a.sheetName.localeCompare(b.sheetName));
      
      setAvailableSheets(sheets);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      await loadData();
      setSaveMessage(`User role updated to ${newRole}`);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleUpdateSheetAccess = async (userId: string, allowedSheets: string[]) => {
    try {
      await updateDoc(doc(db, 'users', userId), { allowedSheets });
      await loadData();
      setSaveMessage('Sheet access updated successfully');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error updating sheet access:', error);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Admin Panel
          </h1>
          <p className="text-slate-600">Manage users, permissions, and system settings</p>
        </div>
      </div>

      {saveMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{saveMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="sheets">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Sheet Management
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user roles and permissions. Users can only access sheets assigned to them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{user.displayName}</h3>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{user.email}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FileSpreadsheet className="w-3 h-3" />
                        <span>
                          {user.role === 'admin' 
                            ? 'Access to all sheets' 
                            : `${user.allowedSheets.length} sheet${user.allowedSheets.length !== 1 ? 's' : ''} assigned`
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(value: 'admin' | 'user') => handleUpdateUserRole(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        onClick={() => openEditDialog(user)}
                        disabled={user.role === 'admin'}
                      >
                        Edit Sheets
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sheets Tab */}
        <TabsContent value="sheets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Sheets</CardTitle>
              <CardDescription>
                All cost centers and rollups found in uploaded reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableSheets.map(sheet => (
                  <div
                    key={sheet.sheetName}
                    className="p-4 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900">{sheet.sheetName}</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Found in {sheet.count} report{sheet.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure global system preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Statistics</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">{users.length}</p>
                      <p className="text-sm text-slate-600 mt-1">Total Users</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-3xl font-bold text-green-600">
                        {users.filter(u => u.role === 'admin').length}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">Admins</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-3xl font-bold text-purple-600">{availableSheets.length}</p>
                      <p className="text-sm text-slate-600 mt-1">Cost Centers</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Sheet Access Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sheet Access</DialogTitle>
            <DialogDescription>
              Select which sheets {selectedUser?.displayName} can access
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                {availableSheets.map(sheet => {
                  const isChecked = selectedUser.allowedSheets.includes(sheet.sheetName);
                  return (
                    <div
                      key={sheet.sheetName}
                      className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      <Checkbox
                        id={sheet.sheetName}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const newSheets = checked
                            ? [...selectedUser.allowedSheets, sheet.sheetName]
                            : selectedUser.allowedSheets.filter(s => s !== sheet.sheetName);
                          setSelectedUser({ ...selectedUser, allowedSheets: newSheets });
                        }}
                      />
                      <label
                        htmlFor={sheet.sheetName}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        {sheet.sheetName}
                      </label>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleUpdateSheetAccess(selectedUser.id, selectedUser.allowedSheets);
                    setEditDialogOpen(false);
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
