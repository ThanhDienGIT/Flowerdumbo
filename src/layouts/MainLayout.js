// src/layouts/MainLayout.js

import React, { Children, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Drawer, Menu as AntMenu, Input, Button } from 'antd';
import { SearchOutlined,StepBackwardOutlined } from '@ant-design/icons';
import AppHeader from './AppHeader';
import Footer from './Footer';

const { Header, Content } = Layout;

// Dữ liệu cho các menu, tách ra để dễ quản lý
const categoryMenuItems = [
    { key: 'cat-1', label: 'Hộp Quà Trà Ngon & Cà Phê Sạch',children:[{ key: 'cat-23', label: 'Hộp quà trà ngon bên trong' },]},
    { key: 'cat-2', label: 'Trà Cầu Đất' },
    { key: 'cat-3', label: 'Cà Phê Cầu Đất' },
    { key: 'cat-4', label: 'Bột Matcha' },
    { key: 'cat-5', label: 'Bột Rau Củ' },
    { key: 'cat-6', label: 'Đặc Sản Đà Lạt' },
    { key: 'cat-7', label: 'Hạt Dinh Dưỡng' },
];
const mainNavItems = [
    { key: 'about', label: 'VỀ CHÚNG TÔI' },
    { key: 'contact', label: 'LIÊN HỆ DALATFARM' },
    { key: 'care', label: 'CHĂM SÓC KHÁCH HÀNG' },
];

function MainLayout() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const showDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  return (
    <Layout>
      <Header style={{ padding: 0, height: 'auto', lineHeight: 'normal' }}>
        <AppHeader onMenuClick={showDrawer} />
      </Header>

      <Content>
        {/* Truyền dữ liệu menu vào các trang con qua Outlet */}
        <Outlet context={{ categoryMenuItems }} />
      </Content>

      <Footer/>

      {/* Drawer cho giao diện mobile */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={closeDrawer}
        open={drawerVisible}
        bodyStyle={{ padding: '15px' }}
      >
        <Input.Search
          placeholder="Tìm kiếm..."
          style={{ marginBottom: '20px' }}
        />
        <AntMenu
          mode="inline"
          items={mainNavItems}
          style={{ border: 'none', marginBottom: '15px' }}
          onClick={closeDrawer}
        />
        <AntMenu
          mode="inline"
          items={categoryMenuItems}
          style={{ border: 'none' }}
          defaultOpenKeys={['categories']}
        
          onClick={closeDrawer}
        />
      </Drawer>
    </Layout>
  );
}

export default MainLayout;