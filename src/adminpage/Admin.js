import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  theme,
  Card,
  Button,
  Space,
  Typography,
  notification,
} from "antd"; // <-- Đã thêm notification vào đây
import {
  DesktopOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  FileOutlined,
  ShopOutlined,
  AppstoreAddOutlined,
  LogoutOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  //getItem("Dashboard", "/admin/main", <PieChartOutlined />),
  getItem("Quản lý Hoa", "/admin/main/listflower", <ShopOutlined />),
  getItem(
    "Quản lý danh mục hoa",
    "/admin/main/category",
    <AppstoreAddOutlined />
  ),

  getItem(
    "Cấu hình web",
    "/admin/main/setting",
    <SettingOutlined />
  ),

  // getItem(
  //   "Cấu hình web",
  //   "/admin/main/setting",
  //   <SettingOutlined />
  // ),

  // getItem("Người dùng", "sub1", <UserOutlined />, [
  //   getItem("Tom", "/admin/users/tom"),
  //   getItem("Bill", "/admin/users/bill"),
  //   getItem("Alex", "/admin/users/alex"),
  // ]),
  // getItem("Đội ngũ", "sub2", <TeamOutlined />, [
  //   getItem("Team 1", "/admin/teams/team1"),
  //   getItem("Team 2", "/admin/teams/team2"),
  // ]),
  // getItem("Files", "/admin/files", <FileOutlined />),
  // getItem("test", "/admin/main/test", <FileOutlined />),
];

const Admin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [check, setCheck] = useState(false);
  const navigate = useNavigate();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/admin/login", { replace: true });
    notification.success({
      message: "Đăng xuất thành công",
      description: "Bạn đã đăng xuất khỏi hệ thống quản trị.",
      duration: 2,
    });
  };

  useEffect(() => {
    if (
      localStorage.getItem("adminLoggedIn") &&
      localStorage.getItem("adminLoggedIn") != null
    ) {
      setCheck(true);
    } else {
      navigate("/admin/login", { replace: true });
      setCheck(false);
    }
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div
          className="demo-logo-vertical"
          style={{
            height: "32px",
            margin: "16px",
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "6px",
          }}
        />
        <Menu
          theme="dark"
          defaultSelectedKeys={["/admin"]}
          mode="inline"
          items={items}
          onSelect={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {check ? (
            <Text style={{ fontSize: "18px", fontWeight: "bold" }}>
              Xin chào, Tuyết Kha
            </Text>
          ) : (
            <Text style={{ fontSize: "18px", fontWeight: "bold" }}>
              Nhập mật khẩu
            </Text>
          )}

          
          {check ? (
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          ) : (
            ""
          )}
        </Header>

        <Content style={{ margin: "0 16px" }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
         

            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Admin;
