import React, { useEffect, useState } from "react";
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
  MenuOutlined,
  CaretDownOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import "./AppHeader.css"; // Đảm bảo file CSS này tồn tại và được cấu hình đúng
import { Link } from "react-router-dom";
import { getListCategory } from "../function/CategoryAPI";

const { Title, Text, Link: AntdLink } = Typography; // Đổi tên Link của Ant Design để tránh trùng với Link của react-router-dom

// Bảng màu xanh lá cây dựa trên ảnh bạn cung cấp
const themeColors = {
  headerBg: "#3E6140", // Màu xanh lá cây đậm cho toàn bộ header
  white: "#FFFFFF", // Màu trắng cho chữ và icon
  searchBg: "#FFFFFF", // Màu nền cho ô tìm kiếm
  // Các màu khác có thể giữ lại nếu được sử dụng ở các component khác
  primary: "#4CAF50",
  primaryDark: "#2E7D32",
  accent: "#8BC34A",
  background: "#f8f9f8",
  lightGreenBg: "rgba(139, 195, 74, 0.1)",
  categoryBarBg: "#E8F5E9", // Màu này có thể không cần nếu categoryItems là menu chính
};

// Cập nhật styles cho giao diện mới
const styles = {
  headerWrapper: {
    backgroundColor: themeColors.headerBg, // Nền xanh lá cây cho toàn bộ header
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  mainHeader: {
    padding: "15px 50px", // Giảm padding trên dưới một chút
  },
  logoText: {
    color: themeColors.white,
    fontWeight: "bold",
    lineHeight: 1, // Đảm bảo căn chỉnh tốt
  },
  subLogoText: {
    color: themeColors.white,
    fontSize: "14px",
    lineHeight: 1,
  },
  searchInput: {
    backgroundColor: themeColors.searchBg, // Nền trắng cho ô tìm kiếm
    borderRadius: "4px",
  },
  contactText: {
    color: themeColors.white,
  },
  contactPhoneText: {
    color: themeColors.white,
    fontWeight: "bold",
  },
  iconStyle: {
    fontSize: 24,
    color: themeColors.white, // Icon màu trắng
  },
  badgeIconStyle: {
    fontSize: 28,
    color: themeColors.white, // Icon giỏ hàng màu trắng
    cursor: "pointer",
  },
  // Style cho thanh danh mục (menu chính)
  mainMenuRow: {
    backgroundColor: themeColors.headerBg, // Nền xanh lá cây đậm cho menu chính
    padding: "10px 0",
    borderTop: `1px solid ${themeColors.white}20`, // Viền phân cách nhẹ
  },
  // Style cho nút menu trên mobile
  mobileMenuButton: {
    border: "none",
    background: "transparent",
    fontSize: "24px",
    color: themeColors.white, // Nút menu mobile màu trắng
  },
};

const AppHeader = ({ onMenuClick }) => {
  // navItems này sẽ được thay thế bằng categoryItems để phù hợp với ảnh
  // Tuy nhiên, nếu bạn muốn giữ navItems cho mục đích khác, có thể cân nhắc
  // Hiện tại, tôi sẽ dùng categoryItems làm menu chính theo ảnh

  const [categoryItems, setCategoryItems] = useState([]);

  const defaultNavItems = [
    {
      key: "link-home",
      label: <Link to={"/"}>TRANG CHỦ</Link>,
    },
    {
      key: "tat-ca-san-pham",
      label: <Link to={"/projects"}>TẤT CẢ SẢN PHẨM</Link>, // Giả định có trang /products
    },
    {
      key: "bo-hoa-tuoi",
      label: "BÓ HOA TƯƠI",
      children: [{ key: "bo-hoa-tuoi-option1", label: "Option 1" }],
    },
    {
      key: "ke-hoa-chuc-mung",
      label: "KỆ HOA CHÚC MỪNG",
      icon: <CaretDownOutlined />, // Có thể thêm icon nếu muốn
      children: [
        { key: "ke-hoa-chuc-mung-option1", label: "Option 1" },
        { key: "ke-hoa-chuc-mung-option2", label: "Option 2" },
      ],
    },
    {
      key: "hoa-cuoi",
      label: "HOA CƯỚI",
    },
    {
      key: "hoa-sap",
      label: "HOA SÁP",
    },
    {
      key: "tin-tuc",
      label: "TIN TỨC",
    },
    {
      key: "lien-he",
      label: "LIÊN HỆ",
    },
  ];

  // Sử dụng categoryItems nếu có, nếu không thì dùng defaultNavItems
  const menuItems = categoryItems.length > 0 ? categoryItems : defaultNavItems;

  const fetchData = async () => {
    
    const dataReturn = []
    
    const data = await getListCategory();
    const formattedCategories = data.map((cat) => ({
      id: cat.id,
      img: cat.image,
      label: cat.name.toUpperCase(),
      link: `/projects/${cat.id}`,
    }));

    const dataDefault = [{
      key: "link-home",
      label: <Link to={"/"}>TRANG CHỦ</Link>,
    },
    {
      key: "tat-ca-san-pham",
      label: <Link to={"/projects"}>TẤT CẢ SẢN PHẨM</Link>, // Giả định có trang /products
    },]
    
    dataDefault.map(ele=>{
      dataReturn.push(ele);
    })

    
    formattedCategories.map((ele, index) => {
      const object = {
        key: "hoa" + index,
        label: <Link to={ele.link}>{ele.label}</Link>,
      };
      dataReturn.push(object);
      
    });



    return dataReturn;
  };

  useEffect(() => {
    
    const getData = async () => {
      setCategoryItems(await fetchData())
    }

    getData()

  }, []);

  return (
    <div style={styles.headerWrapper}>
      {/* ===== DESKTOP HEADER ===== */}
      <div className="desktop-header">
        {/* Tầng 1: Logo, Search, Contact */}
        <div style={styles.mainHeader}>
          <Row justify="space-between" align="middle" gutter={24}>
            <Col
              lg={7}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <Link to={"/"}>

             

                <Title level={3} style={styles.logoText}>
                  XƯỞNG HOA CỦA KHA
                </Title>
                <Text style={styles.subLogoText}>CHẤT LƯỢNG - ĐẸP</Text>
              </Link>
            </Col>
            <Col lg={10}>
              <Input.Search
                placeholder="Tìm sản phẩm..."
                size="large"
                style={styles.searchInput}
                allowClear // Cho phép xóa nhanh nội dung
              />
            </Col>
            <Col lg={7}>
              <Row justify="end" align="middle" gutter={24}>
                <Col>
                  <Space>
                    <PhoneOutlined style={styles.iconStyle} />
                    <div>
                      <Text style={styles.contactText}>Gọi mua hàng</Text>
                      <br />
                      <Text style={styles.contactPhoneText}>0843.266.691</Text>
                    </div>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <UserOutlined style={styles.iconStyle} />
                    <Text style={styles.contactText}>Tài khoản</Text>
                  </Space>
                </Col>
                {/* <Col>
                  <Badge count={0} showZero size="small" offset={[-5, 5]}>
                    <ShoppingCartOutlined style={styles.badgeIconStyle} />
                  </Badge>
                  <Text style={styles.contactText}>Giỏ Hàng</Text>
                </Col> */}
              </Row>
            </Col>
          </Row>
        </div>

        {/* Tầng 2: Menu chính (dựa trên categoryItems hoặc defaultNavItems) */}
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                darkItemBg: themeColors.headerBg, // Nền chung của Menu
                darkItemColor: themeColors.white, // Màu chữ thường
                darkItemHoverColor: themeColors.white, // Màu chữ khi di chuột
                darkItemHoverBg: themeColors.primaryDark, // Màu nền khi di chuột
                darkItemSelectedColor: themeColors.white, // Màu chữ của item được chọn
                darkItemSelectedBg: themeColors.primaryDark, // Màu nền của item được chọn
                darkSubMenuItemBg: themeColors.primaryDark, // Màu nền của submenu
                itemBorderRadius: 0, // Bỏ bo góc nếu không muốn
              },
            },
          }}
        >
          <Row align="middle" style={styles.mainMenuRow}>
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={["link-home"]}
              items={menuItems}
              style={{
                width: "100%",
                justifyContent: "center",
                borderBottom: "none",
                backgroundColor: themeColors.headerBg,
              }}
              className="green-theme-main-menu"
            />
          </Row>
        </ConfigProvider>
      </div>

      {/* ===== MOBILE HEADER ===== */}
      <div
        className="mobile-header"
        style={{
          display: "none", // Sẽ được hiển thị bằng CSS media query
          padding: "10px 15px",
          backgroundColor: themeColors.headerBg, // Nền xanh lá cây đậm cho mobile header
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
            <Link to={"/"}>
              <Title level={4} style={styles.logoText}>
                XƯỞNG HOA CỦA KHA
              </Title>
            </Link>
          </Col>
          <Col>
            <Badge count={0} showZero size="small">
              <ShoppingCartOutlined style={styles.badgeIconStyle} />
            </Badge>
          </Col>
        </Row>
      </div>

      {/* CSS để chuyển đổi giao diện và style cho menu */}
      <style>{`
        /* Responsive hide/show */
        @media (min-width: 992px) { .desktop-header { display: block !important; } }
        @media (max-width: 991px) { .mobile-header { display: block !important; } }

        /* Custom styles for Ant Design Menu in green theme */
        .green-theme-main-menu.ant-menu-horizontal {
          border-bottom: none; /* Remove default border */
        }
        .green-theme-main-menu.ant-menu-horizontal > .ant-menu-item,
        .green-theme-main-menu.ant-menu-horizontal > .ant-menu-submenu {
          padding: 0 20px; /* Tăng padding ngang cho các item */
        }
        /* Loại bỏ gạch chân khi chọn */
        .green-theme-main-menu.ant-menu-horizontal > .ant-menu-item-selected::after,
        .green-theme-main-menu.ant-menu-horizontal > .ant-menu-submenu-selected::after {
          border-bottom: none !important; /* Đảm bảo không có gạch chân */
        }
        .green-theme-main-menu .ant-menu-submenu-title .anticon {
          color: ${themeColors.white}; /* Màu icon trong submenu title */
        }
        .green-theme-main-menu .ant-menu-title-content {
          color: ${themeColors.white}; /* Đảm bảo màu chữ của menu item là trắng */
        }

        /* Override Ant Design search input default styles */
        .ant-input-search .ant-input-group-addon {
          background-color: ${themeColors.searchBg} !important;
          border-left: none !important;
        }
        .ant-input-search .ant-input-group-addon .ant-btn {
          background-color: ${themeColors.searchBg} !important;
          border: 1px solid #d9d9d9 !important; /* Giữ border cho nút search */
          color: ${themeColors.primaryDark} !important; /* Màu icon search */
        }
        .ant-input-search .ant-input-group-addon .ant-btn:hover {
          color: ${themeColors.primary} !important;
        }
      `}</style>
    </div>
  );
};

export default AppHeader;
