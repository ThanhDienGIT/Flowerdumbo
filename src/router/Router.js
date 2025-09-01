import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import Layout và các Pages
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import NotFoundPage from "../layouts/NotFoundPage";
import ProjectsPage from "../pages/ProjectsPage";
import DetailProjects from "../pages/DetailProjects";
import Admin from "../adminpage/Admin";
import ListFlower from "../adminpage/ListFlower";
import Category from "../adminpage/Category";
import LoginAdmin from "../adminpage/LoginAdmin";
import ProtectedRoute from "../adminpage/ProtectedRoute";
import Setting from "../adminpage/Setting";
import TestAPI from "../adminpage/TestAPI";
import FeedBack from "../pages/FeedBack";
import FeedBackCustomer from "../adminpage/FeedBackCustomer";


const Router = () => {
  return (
    // 1. Bọc toàn bộ bằng BrowserRouter để kích hoạt routing
    <BrowserRouter>
      {/* 2. Routes sẽ tìm Route con phù hợp để render */}
      <Routes>
        {/* 3. Đây là một Nested Route. 
            - MainLayout sẽ luôn được render cho tất cả các route con bên trong nó.
            - Component của các route con (HomePage, ProjectsPage...) sẽ được render vào vị trí <Outlet /> trong MainLayout.
        */}
    
        
        <Route path="/admin/login" element={<LoginAdmin />} />
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route path="/admin/main" element={<Admin />}>
            <Route path="/admin/main/listflower" element={<ListFlower />} />
            <Route path="/admin/main/category" element={<Category />} />
            <Route path="/admin/main/setting" element={<Setting />} />
             <Route path="/admin/main/feedback" element={<FeedBackCustomer />} />
            <Route path="/admin/main/test" element={<TestAPI />} />
            
          </Route>
        </Route>
        <Route path="/" element={<MainLayout />}>
          {/* 'index' có nghĩa là component này sẽ được render khi URL khớp chính xác với path của cha ('/') */}
          <Route index element={<HomePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:categoryId" element={<ProjectsPage />} />
          {/* Đây là một dynamic route. ':projectId' sẽ là một tham số động. 
              Ví dụ: /projects/project-a, /projects/project-b 
          */}

           
        <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        {/* Bạn cũng có thể định nghĩa các route không có MainLayout ở đây, ví dụ: trang login */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        <Route path="feedback" element={<FeedBack />} />
            <Route path="detail" element={<DetailProjects />} />
          <Route path="detail/:detailId" element={<DetailProjects />} />


      </Routes>
    </BrowserRouter>
  );
};

export default Router;
