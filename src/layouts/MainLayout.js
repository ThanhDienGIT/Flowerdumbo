// src/layouts/MainLayout.js

import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { Drawer, Input, FloatButton } from "antd";
import { TikTokOutlined, SafetyCertificateOutlined, HomeOutlined } from "@ant-design/icons";
import AppHeader from "./AppHeader";
import Footer from "./Footer";
import useCatalog from "../hooks/useCatalog";
import { contact } from "../theme/theme";

function MainLayout() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { categories } = useCatalog();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  // Đóng menu và cuộn lên đầu khi đổi trang
  useEffect(() => {
    setDrawerVisible(false);
    window.scrollTo(0, 0);
  }, [pathname, search]);

  const isAdmin = localStorage.getItem("adminLoggedIn") === "true";

  return (
    <div className="shop-layout">
      <AppHeader onMenuClick={() => setDrawerVisible(true)} />

      <main>
        <Outlet context={{ categories }} />
      </main>

      <Footer />

      {/* Menu cho điện thoại */}
      <Drawer
        title="Danh mục"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { padding: 0 } }}
        width={300}
      >
        <div style={{ padding: 16 }}>
          <Input.Search
            placeholder="Tìm hoa theo tên…"
            allowClear
            onSearch={(v) => navigate(v.trim() ? `/projects?q=${encodeURIComponent(v.trim())}` : "/projects")}
          />
        </div>
        <ul className="cat-sidebar__list">
          <li>
            <Link to="/" className="cat-sidebar__item">
              <HomeOutlined className="cat-sidebar__thumb" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }} />
              <span className="cat-sidebar__label">Trang chủ</span>
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link to={`/projects/${cat.id}`} className="cat-sidebar__item">
                {cat.image ? <img src={cat.image} alt="" className="cat-sidebar__thumb" /> : <span className="cat-sidebar__thumb" />}
                <span className="cat-sidebar__label">{cat.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Drawer>

      <FloatButton.Group shape="circle" style={{ right: 24, bottom: 24 }}>
        {isAdmin && (
          <FloatButton icon={<SafetyCertificateOutlined />} tooltip="Trang quản trị" href="/admin/main/listflower" />
        )}
        <FloatButton
          icon={<TikTokOutlined />}
          tooltip="TikTok của shop"
          href={contact.tiktokUrl}
          target="_blank"
        />
        <FloatButton
          icon={
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/120px-Icon_of_Zalo.svg.png"
              width={20}
              height={20}
              alt="Zalo"
            />
          }
          tooltip="Nhắn Zalo đặt hoa"
          href={contact.zaloUrl}
          target="_blank"
        />
        <FloatButton.BackTop tooltip="Lên đầu trang" visibilityHeight={400} />
      </FloatButton.Group>
    </div>
  );
}

export default MainLayout;
