import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Lấy trạng thái đăng nhập từ localStorage
  const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';

  // Nếu đã đăng nhập (isAdminLoggedIn là true), cho phép render nội dung của route con
  // (tức là component Admin và các component con của nó như ListFlower, Category)
  // Ngược lại, nếu chưa đăng nhập, chuyển hướng ngay lập tức về trang /login
  return isAdminLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute
