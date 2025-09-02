import React, { useEffect } from "react";
import { Row, Col, Typography, Space, Menu, Button, Badge } from "antd";
import Icon, {
  TikTokOutlined
} from "@ant-design/icons";
import "./AppHeader.css"; // Đảm bảo file CSS này tồn tại và được cấu hình đúng
import { Link } from "react-router-dom";
// Hãy chắc chắn rằng đường dẫn đến logo của bạn là chính xác
import logo from "../assets/images/z6890559277656_f1ca855ae19bbf61771c9bdc47437271.jpg"; // GỢI Ý: Bạn nên thay thế file logo hiện tại bằng logo trong ảnh
import { getListCategory } from "../function/CategoryAPI";
import { set } from "firebase/database";
const { Text } = Typography;

// Bảng màu được cập nhật
const themeColors = {
  topBarBg: "#1A644D", // Màu xanh lá cây đậm chính
  menuHoverDarkBg: "#2A785D", // Màu nền xanh lá sáng hơn một chút khi hover menu
  white: "#FFFFFF",
  mainHeaderBg: "#FFFFFF",
  textColor: "#333333",
};

// Cập nhật styles cho giao diện mới
const styles = {
  topBar: {
    backgroundColor: themeColors.topBarBg,
    padding: "8px 0",
    textAlign: "center",
  },
  topBarText: {
    color: themeColors.white,
  },
  mainHeader: {
    backgroundColor: themeColors.mainHeaderBg,
    padding: "15px 50px",
    borderBottom: "1px solid #f0f0f0",
  },
  mainHeaderMobile: {
    backgroundColor: themeColors.mainHeaderBg,
    padding: "10px 15px",
    borderBottom: "1px solid #f0f0f0",
  },
  headerIcons: {
    fontSize: "24px",
    color: themeColors.textColor,
  },
  navBar: {
    backgroundColor: themeColors.topBarBg, // <-- THAY ĐỔI: Nền menu thành xanh đậm
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  navMenu: {
    backgroundColor: "transparent",
    width: "100%",
    justifyContent: "center",
  },
};



const AppHeader = ({ onMenuClick }) => {
  const [navMenuItems, setNavMenuItems] = React.useState([]);
  const fetchCategories = async () => {
    try {
      const categories = await getListCategory();
      const arrayLuuTam = [];
      categories.map((ele) => {
        const object = {
          key: ele.id,
          label:  <Link to={"/projects/" + ele.id}> <span style={{color:'pink'}}>♥</span> {ele.name}</Link>,
        };
        arrayLuuTam.push(object);
      });
      setNavMenuItems(arrayLuuTam);
      console.log("Danh mục từ Realtime DB:", categories);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []); // Hiệu ứng rỗng để tránh cảnh báo

  return (
    <div className="header-wrapper">
      {/* Tầng 1: Giờ mở cửa (Hiển thị trên cả mobile và desktop) */}

      {/* ===== DESKTOP HEADER ===== */}
      <div className="desktop-header">
        {/* Tầng 2: Logo và Icons */}
        <div style={styles.topBar}>
          <Text style={styles.topBarText}>
            CHÀO MỪNG XƯỞNG HOA'S CỦA KHA
          </Text>
        </div>
        <Row style={styles.mainHeader} justify="space-between" align="middle">
          <Col></Col>
          <Col>
            <Link to={"/"}>
              <img src={logo} alt="Logo" style={{ height: 150 }} />
            </Link>
          </Col>
          <Col style={{display:'flex',gap:10}}>
            <Button href="https://zalo.me/84843266691" target="_blank" rel="noopener noreferrer" shape="circle"
              style={{
                backgroundColor: '#0068ff',
                color: 'white',
                borderColor: '#0068ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width:40,
                height:40
              }}
              >
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/1024px-Icon_of_Zalo.svg.png" width={20} height={20} alt=''/>
              </Button>
              <Button href="https://www.tiktok.com/@xng.hoa.online" shape="circle" target="_blank" rel="noopener noreferrer" style={{backgroundColor:"black",color:'white',width:40,height:40}} icon={<TikTokOutlined />} />
          </Col>
        </Row>

        {/* Tầng 3: Menu chính */}
        <Row style={styles.navBar} justify="center" align="middle">
          <Menu
            mode="horizontal"
            items={navMenuItems}
            style={styles.navMenu}
            className="main-nav-menu"
          />
        </Row>
      </div>

      {/* ===== MOBILE HEADER ===== */}
      <div className="mobile-header">
        <div style={styles.topBar}>
          <Text style={styles.topBarText}>
           Chào mừng quý khách đến Xưởng Hoa's của Kha
          </Text>
        </div>
        {/* Tầng 2: Logo và Icons */}
        <Row style={styles.mainHeader} justify="center" align="middle">
        
          <Col>
            <Link to={"/"}>
              <img src={logo} alt="Logo" style={{ height: 150 }} />
            </Link>
          </Col>
       
         
        </Row>

        {/* Tầng 3: Menu chính */}
        <Row style={styles.navBar} justify="center" align="middle">
          <Menu
            mode="horizontal"
            items={navMenuItems}
            style={styles.navMenu}
            className="main-nav-menu"
          />
        </Row>
      </div>



      {/* CSS để chuyển đổi giao diện và style cho menu */}
      <style>{`
        
        .desktop-header { display: block; }
        .mobile-header { display: none;  }

        @media (max-width: 991px) {
          .desktop-header { display: none; }
          .mobile-header { display: block; }
        }

        /* === Custom styles for Ant Design Menu === */
        
        /* Bỏ gạch chân mặc định */
        .main-nav-menu.ant-menu-horizontal > .ant-menu-item::after,
        .main-nav-menu.ant-menu-horizontal > .ant-menu-submenu::after {
          border-bottom: none !important;
        }

        /* THAY ĐỔI: Chỉnh màu chữ menu thành trắng và giảm khoảng cách */
        .main-nav-menu .ant-menu-item,
        .main-nav-menu .ant-menu-submenu-title {
          padding: 8px 16px !important;
          margin: 0 2px !important; /* Giảm khoảng cách giữa các mục */
          border-radius: 6px;
          color: ${themeColors.white} !important; /* Đổi màu chữ thành trắng */
          font-weight: 500;
          transition: background-color 0.3s;
        }

        /* THAY ĐỔI: Hiệu ứng nền khi hover trên nền xanh đậm */
        .main-nav-menu .ant-menu-item:hover,
        .main-nav-menu .ant-menu-submenu-title:hover,
        .main-nav-menu .ant-menu-item-selected,
        .main-nav-menu .ant-menu-submenu-selected .ant-menu-submenu-title {
          background-color: ${themeColors.menuHoverDarkBg} !important;
          color: ${themeColors.white} !important;
        }
        
        /* Đảm bảo icon mũi tên cũng màu trắng */
        .main-nav-menu .ant-menu-submenu-title .ant-menu-item-icon {
            vertical-align: middle;
            margin-left: 6px;
            font-size: 10px;
            color: ${themeColors.white} !important;
        }
        .main-nav-menu .ant-menu-title-content {
             vertical-align: middle;
        }

      `}</style>
    </div>
  );
};

export default AppHeader;
