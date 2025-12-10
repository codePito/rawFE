import React, { useState, useEffect, useCallback } from 'react'; 
import { Search, UserPlus } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import authApi from '../../../../src/api/authApi'; 
import { User } from '../../types';
import { formatDate } from '../../utils/formatters';
import { USER_ROLES } from '../../utils/constants';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // =========================================================
  // READ: Hàm fetch users từ API
  // =========================================================
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await authApi.getAllUsers(); 
      const apiData = response.data;

      const rawList = apiData.result || apiData;
      const userList = Array.isArray(rawList) ? rawList : [];

      // *** ÁNH XẠ DỮ LIỆU SANG CẤU TRÚC FRONTEND ***
      const mappedUsers: User[] = userList.map((u: any) => {
        const role = u.role?.toLowerCase() as 'admin' | 'user' | 'seller' || 'user';
        const fullName = u.userName || 'No Name';
        const emailPlaceholder = `${fullName.toLowerCase().replace(/\s/g, '') || 'user'}_${u.id}@shophub.com`;

        return {
          id: u.id?.toString() || u.userName,
          email: u.email || emailPlaceholder, 
          fullName: fullName,
          
          // FIX MAPPING: Dùng API address gán cho field phone của Frontend
          phone: u.address || 'N/A', 
          
          avatar: u.avatar,
          role: role, 
          status: (u.status || 'active') as 'active' | 'locked', 
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
          lastLogin: u.lastLogin ? new Date(u.lastLogin) : undefined,
        };
      });
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(); // Gọi API khi component mount
  }, [fetchUsers]);


  // Logic phân trang (sử dụng users đã fetch)
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = users.slice(startIndex, startIndex + itemsPerPage);
  
  const columns = [{
    key: 'user',
    label: 'User',
    render: (user: User) => <div>
          <p className="font-medium text-gray-900">{user.fullName}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
  }, {
    key: 'phone',
    // FIX UI: Đổi tiêu đề cột từ "Phone" sang "Address"
    label: 'Address', 
    render: (user: User) => <span className="text-gray-900">{user.phone}</span>
  }, {
    key: 'role',
    label: 'Role',
    render: (user: User) => <Badge variant={USER_ROLES[user.role].color as any}>
          {USER_ROLES[user.role].label}
        </Badge>
  }, {
    key: 'status',
    label: 'Status',
    render: (user: User) => <Badge variant={user.status === 'active' ? 'green' : 'red'}>
          {user.status === 'active' ? 'Active' : 'Locked'}
        </Badge>
  }, {
    key: 'createdAt',
    label: 'Joined',
    render: (user: User) => <span className="text-sm text-gray-500">
          {formatDate(user.createdAt)}
        </span>
  }];


  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage user accounts</p>
        </div>
        <Button variant="primary">
          <UserPlus className="w-5 h-5 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search users..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
        </div>
      </Card>

      <Card padding={false}>
        {isLoading ? (
            <div className="p-6 text-center text-gray-500">Đang tải danh sách người dùng...</div>
        ) : (
            <Table columns={columns} data={paginatedUsers} />
        )}
        
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </Card>
    </div>;
}