import React, { useState } from "react";
import {
  Row,
  Col,
  Input,
  Typography,
  Space,
  Menu,
  Button,
  Badge,
  ConfigProvider,
} from "antd";
import {
  PhoneOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  MenuOutlined,
  CaretDownOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import "./AppHeader.css";
import { Link } from "react-router-dom";
const { Text } = Typography;

// Bảng màu xanh lá cây mới
const themeColors = {
  primary: "#123524", // Xanh lá cây chính cho thanh menu
  primaryDark: "#18230F", // Xanh lá cây đậm hơn cho chữ
  accent: "#1F7D53", // Màu nhấn
};

// Cập nhật styles cho giao diện mới
const styles = {
  headerWrapper: {
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  mainHeader: {
    padding: "20px 50px",
  },
  navBar: {
    backgroundColor: themeColors.primary, // Nền màu xanh lá đậm
    padding: "10px", // Giữ padding để cân đối
  },
  // --- STYLE MỚI CHO THANH DANH MỤC ---
  categoryBar: {
    backgroundColor: "#fff",
    borderTop: "1px solid #f0f0f0",
    padding: "0 50px",
  },
  // Style cho nút menu trên mobile
  mobileMenuButton: {
    border: "none",
    background: "transparent",
    fontSize: "24px",
    color: themeColors.primary,
  },
};

const AppHeader = ({ onMenuClick, categoryItems = [] }) => {
  const [navItems, setNavItems] = useState([
    {
      key: "link",
      icon: <HomeOutlined />,
      label: <Link to={"/"}>TRANG CHỦ</Link>,
    },
    {
      key: "1",
      icon: <CaretDownOutlined />,
      label: "HOA HỒNG",
      children: [{ key: "10", label: "Option 10" }],
    },
    {
      key: "sub1",
      label: "HOA 8/3",
      icon: <CaretDownOutlined />,
      children: [
        { key: "3", label: "Option 3" },
        { key: "4", label: "Option 4" },
        {
          key: "sub1-2",
          label: "Submenu",
          children: [
            { key: "5", label: "Option 5" },
            { key: "6", label: "Option 6" },
          ],
        },
      ],
    },
    {
      key: "sub2",
      label: "MÀU SẮC",
      icon: <CaretDownOutlined />,
      children: [
        { key: "7", label: "Option 7" },
        { key: "8", label: "Option 8" },
        { key: "9", label: "Option 9" },
        { key: "10", label: "Option 10" },
      ],
    },
  ]);

  return (
    <div style={styles.headerWrapper}>
      {/* ===== DESKTOP HEADER ===== */}
      <div className="desktop-header" style={{ display: "none" }}>
        {/* Tầng 1: Logo, Search, Contact */}
        <div style={styles.mainHeader}>
          <Row justify="space-between" align="middle" gutter={16}>
            <Col lg={4} style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Link to={'/'}>
               <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSGRAuKy2Mn32VrWf6Sn_Xhi9fXvn2FcqFJg&s"
                alt="Fresh Garden Logo"
                style={{ height: "50px" }}
              />
              </Link>
             
              <Button color="cyan" onClick={onMenuClick} icon={<MenuOutlined/>}/>
            </Col>
            <Col lg={12}>
              <Input.Search placeholder="Tìm kiếm sản phẩm..." size="large" />
            </Col>
            <Col lg={8}>
              <Row justify="end" align="middle" gutter={24}>
                <Col>
                  <Space>
                    <PhoneOutlined
                      style={{ fontSize: 24, color: themeColors.accent }}
                    />
                    <div>
                      <Text>Tư vấn và hỗ trợ</Text>
                      <br />
                      <Text strong>0365.525.0680</Text>
                    </div>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <UserOutlined
                      style={{ fontSize: 24, color: themeColors.accent }}
                    />
                  </Space>
                </Col>
                <Col>
                  <Badge count={5} size="small">
                    <ShoppingCartOutlined
                      style={{
                        fontSize: 28,
                        color: themeColors.accent,
                        cursor: "pointer",
                      }}
                    />
                  </Badge>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
        {/* 
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                // Tùy chỉnh các token cho theme "dark"
                darkItemBg: "#1F7D53", // Màu nền chung của Menu (màu xanh lá của bạn)
                darkItemColor: "#FFFFFF", // Màu chữ ở trạng thái thường
                darkItemHoverColor: "#FFFFFF", // Màu chữ khi di chuột qua
                darkItemHoverBg: "#2E8B57", // Màu nền khi di chuột qua (một màu xanh lá hơi khác để tạo điểm nhấn)
                darkItemSelectedColor: "#FFFFFF", // Màu chữ của item được chọn
                darkItemSelectedBg: "#2a7c56", // Màu nền của item được chọn (đậm hơn một chút)
              },
            },
          }}
        >
          <Row
            align="middle"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1F7D53",
              padding:20
            }}
          >
            <Menu
              // Quan trọng: Thêm theme="dark" để áp dụng các token "dark..."
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={["home"]}
              items={navItems}
              style={{ width: "100%", justifyContent: "center" }} // Style để menu dàn đều và đẹp hơn
              className="green-theme-main-menu" // Quan trọng là có className này
            />
          </Row>
        </ConfigProvider> */}

        {/* Tầng 3: Menu danh mục */}
        <div style={styles.categoryBar}>
          <Row align="middle">
            <Col span={24}>
              <Menu
                mode="horizontal"
                items={categoryItems}
                className="category-main-menu"
              />
            </Col>
          </Row>
        </div>
      </div>

      {/* ===== MOBILE HEADER ===== */}
      <div
        className="mobile-header"
        style={{
          display: "none",
          padding: "10px 15px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Button onClick={onMenuClick} style={styles.mobileMenuButton}>
              <MenuOutlined />
            </Button>
          </Col>
          <Col>
           <Link to={'/'}>
            <img
              src="https://freshgarden.vn/template/images/logo-freshgarden.svg"
              alt="Fresh Garden Logo"
              style={{ height: "40px" }}
            />
           </Link>
           
          </Col>
          <Col>
            <Badge count={5} size="small">
              <ShoppingCartOutlined
                style={{ fontSize: 24, color: themeColors.accent }}
              />
            </Badge>
          </Col>
        </Row>
      </div>

      {/* CSS để chuyển đổi giao diện và style cho menu */}
      <style>{`
        /* Responsive hide/show */
        @media (min-width: 992px) { .desktop-header { display: block !important; } }
        @media (max-width: 991px) { .mobile-header { display: block !important; } }

        
      `}</style>
    </div>
  );
};

export default AppHeader;
