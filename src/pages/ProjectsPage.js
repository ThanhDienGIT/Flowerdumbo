import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout, Menu, Card, Row, Col, Breadcrumb, ConfigProvider, Button, Space, Spin } from 'antd';
import { TikTokOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';

// Import API functions
import { getFlowersByCategoryId, getListFlower } from '../function/FlowerAPI';
import { getListCategory, getCategoryById } from '../function/CategoryAPI';

const { Content, Sider, Footer } = Layout;
const { Meta } = Card;

// =============================================================================
// ICON ZALO TÙY CHỈNH
// =============================================================================
const ZaloIcon = () => (
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="1em" height="1em" viewBox="0 0 460.1 436.2" fill="currentColor">
        <path d="M131.7,219.5h52.6v113.2h-52.6V219.5z M211.5,219.5h52.6v113.2h-52.6V219.5z M291.3,219.5h52.6v113.2h-52.6V219.5z M390.3,85.2C353.9,49.4,307,30,256,30c-52.1,0-99.8,19.9-136.6,56.6c-36.8,36.8-56.6,84.5-56.6,136.6c0,52.1,19.9,99.8,56.6,136.6c36.8,36.8,84.5,56.6,136.6,56.6c49.4,0,95-18.5,130.6-52.4c0,0,0,0,0,0c0.2-0.2,0.4-0.4,0.6-0.6c35.8-35.3,55.4-81.8,55.4-133.6C446.4,167.9,426.8,121.2,390.3,85.2z M357.1,335c-27.8,26.4-64.4,42.4-104.2,42.4c-81.2,0-147.1-65.9-147.1-147.1c0-81.2,65.9-147.1,147.1-147.1c38.7,0,74.4,15,101.1,41.7c26.7,26.7,41.7,62.4,41.7,101.1C398.8,272.2,382.9,308.8,357.1,335z"/>
    </svg>
);

function ProjectsPage() {
  const { categoryId } = useParams(); // Lấy categoryId từ URL
  const [products, setProducts] = useState([]); // State để lưu trữ danh sách hoa
  const [sidebarCategories, setSidebarCategories] = useState([]); // State để lưu trữ danh mục sidebar
  const [currentCategoryName, setCurrentCategoryName] = useState('Shop hoa'); // State lưu tên danh mục hiện tại
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const themeConfig = {
    token: {
      colorPrimary: '#4A634A',
      colorLink: '#4A634A',
      colorLinkHover: '#617961',
      fontSize: 12,
      borderRadius: 8,
    },
    components: {
        Menu: {
            itemSelectedBg: '#E9F0E9',
            itemSelectedColor: '#4A634A',
        }
    }
  };

  const handleContactClick = (e, platform, product) => {
    e.preventDefault();
    console.log(`Đang chuyển đến ${platform} cho sản phẩm: ${product.name}`);
  };

  // Effect để tải danh sách hoa khi categoryId thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        let fetchedProducts;
        let categoryDisplayName = 'Tất cả hoa'; // Giá trị mặc định cho breadcrumb

        if (categoryId) {
          fetchedProducts = await getFlowersByCategoryId(categoryId);
          const category = await getCategoryById(categoryId);
          if (category) {
            categoryDisplayName = category.name;
          } else {
            categoryDisplayName = 'Không tìm thấy danh mục';
          }
        } else {
          fetchedProducts = await getListFlower();
          categoryDisplayName = 'Tất cả hoa';
        }
        setProducts(fetchedProducts);
        setCurrentCategoryName(categoryDisplayName);
      } catch (error) {
        console.error("Lỗi khi tải danh sách hoa:", error);
        setProducts([]);
        setCurrentCategoryName('Lỗi tải hoa');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  // Effect để tải danh sách danh mục cho sidebar (chỉ chạy một lần)
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const categories = await getListCategory();
        const allFlowersItem = {
          key: 'all',
          label: <Link to="/projects">TẤT CẢ HOA</Link>,
        };
        const menuItems = categories.map(cat => ({
          key: cat.id,
          label: <Link to={`/projects/${cat.id}`}>{cat.name.toUpperCase()}</Link>,
        }));
        setSidebarCategories([allFlowersItem, ...menuItems]);
      } catch (error) {
        console.error("Lỗi khi tải danh mục sidebar:", error);
        setSidebarCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <ConfigProvider theme={themeConfig}>
      {/* ============================================================================= */}
      {/* CSS Animation được nhúng trực tiếp trong component */}
      {/* KHÔNG NÊN DÙNG CÁCH NÀY CHO ỨNG DỤNG LỚN VÌ CÓ THỂ ẢNH HƯỞNG HIỆU SUẤT */}
      {/* Đây là cách để đáp ứng yêu cầu "viết thẳng trong file" */}
      {/* ============================================================================= */}
      <style>{`
        @keyframes pulse-glow {
          0% {
            transform: scale(1) rotate(0deg) !important;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.4) !important;
            opacity: 1 !important;
          }
          25% {
            transform: scale(1.05) rotate(1deg) !important;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.2) !important;
            opacity: 0.95 !important;
          }
          50% {
            transform: scale(1) rotate(-1deg) !important;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.4) !important;
            opacity: 1 !important;
          }
          75% {
            transform: scale(1.05) rotate(1deg) !important;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.2) !important;
            opacity: 0.95 !important;
          }
          100% {
            transform: scale(1) rotate(0deg) !important;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.4) !important;
            opacity: 1 !important;
          }
        }

        .ant-btn.pulse-glow-effect {
          animation: pulse-glow 2s infinite ease-in-out !important;
          will-change: transform, box-shadow, opacity;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          transition: none !important; /* Vô hiệu hóa các transition mặc định */
        }

        /* Để đảm bảo animation áp dụng đúng cho icon SVG bên trong button */
        .ant-btn.pulse-glow-effect .anticon svg {
            animation: pulse-glow 2s infinite ease-in-out !important;
            transform-origin: center center !important;
        }
      `}</style>
      {/* ============================================================================= */}

      <Layout style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
        <Sider
          width={180}
          breakpoint="lg"
          collapsedWidth="0"
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            position: 'sticky',
            top: 0,
            height: '100vh',
           }}
        >
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <h2 style={{ color: themeConfig.token.colorPrimary, fontSize: '16px' }}>DANH MỤC</h2>
          </div>
          {loadingCategories ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="small" />
            </div>
          ) : (
            <Menu
              mode="inline"
              selectedKeys={[categoryId || 'all']}
              style={{ borderRight: 0 }}
              items={sidebarCategories}
            />
          )}
        </Sider>
        <Layout style={{ padding: '0 16px 16px', backgroundColor: '#fff' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item><Link to="/">Trang chủ</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/projects">Shop hoa</Link></Breadcrumb.Item>
            <Breadcrumb.Item>{currentCategoryName}</Breadcrumb.Item>
          </Breadcrumb>
          <Content
            style={{ padding: 12, margin: 0, minHeight: 280, background: '#f9f9f9' }}
          >
            {loadingProducts ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="Đang tải sản phẩm..." />
              </div>
            ) : (
              <Row gutter={[16, 24]}>
                {products.length === 0 ? (
                  <Col span={24} style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Không có sản phẩm nào trong danh mục này.</p>
                  </Col>
                ) : (
                  products.map((product) => (
                    <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                      <Link to={`/detail/${product.id}`}>
                        <Card
                          hoverable
                          cover={<img alt={product.name} src={product.image} style={{ height: 200, objectFit: 'cover' }} />}
                          bodyStyle={{ padding: '12px' }}
                        >
                          <Meta
                            title={<span style={{ fontWeight: 'bold', fontSize: '14px' }}>{product.name}</span>}
                            description={<span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.65)' }}>{product.description}</span>}
                          />
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '10px'
                          }}>
                            <span style={{
                              fontSize: '16px',
                              fontWeight: 'bold',
                              color: themeConfig.token.colorPrimary,
                            }}>
                              {product.price ? product.price.toLocaleString('vi-VN') + ' đ' : 'Liên hệ'}
                            </span>
                            <Space>
                              <Button
                                shape="circle"
                                size="small"
                                onClick={(e) => handleContactClick(e, 'Zalo', product)}
                                icon={<Icon component={ZaloIcon} style={{ fontSize: '14px' }}/>}
                                style={{
                                  backgroundColor: '#0068ff',
                                  color: 'white',
                                  borderColor: '#0068ff',
                                }}
                                className="pulse-glow-effect" // <-- Đã thêm class này
                              />
                              <Button
                                shape="circle"
                                size="small"
                                icon={<TikTokOutlined />}
                                onClick={(e) => handleContactClick(e, 'TikTok', product)}
                                style={{
                                  backgroundColor: '#222',
                                  color: 'white',
                                  borderColor: '#222',
                                }}
                                className="pulse-glow-effect" // <-- Đã thêm class này
                              />
                            </Space>
                          </div>
                        </Card>
                      </Link>
                    </Col>
                  ))
                )}
              </Row>
            )}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default ProjectsPage;