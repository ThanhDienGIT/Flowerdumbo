import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout, Menu, Card, Row, Col, Breadcrumb, ConfigProvider, Button, Space, Spin, Input, Slider, Typography, Divider } from 'antd';
import { TikTokOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';

// Import API functions
import { getFlowersByCategoryId, getListFlower } from '../function/FlowerAPI';
import { getListCategory, getCategoryById } from '../function/CategoryAPI';

// Import DTO để đảm bảo cấu trúc dữ liệu
import FlowerCategoryDTO from '../DTO/FlowerCategoryDTO';

const { Content, Sider } = Layout;
const { Meta } = Card;
const { Title, Text } = Typography;

// =============================================================================
// ICON ZALO TÙY CHỈNH
// =============================================================================
const ZaloIcon = () => (
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="1em" height="1em" viewBox="0 0 460.1 436.2" fill="currentColor">
        <path d="M131.7,219.5h52.6v113.2h-52.6V219.5z M211.5,219.5h52.6v113.2h-52.6V219.5z M291.3,219.5h52.6v113.2h-52.6V219.5z M390.3,85.2C353.9,49.4,307,30,256,30c-52.1,0-99.8,19.9-136.6,56.6c-36.8,36.8-56.6,84.5-56.6,136.6c0,52.1,19.9,99.8,56.6,136.6c36.8,36.8,84.5,56.6,136.6,56.6c49.4,0,95-18.5,130.6-52.4c0,0,0,0,0,0c0.2-0.2,0.4-0.4,0.6-0.6c35.8-35.3,55.4-81.8,55.4-133.6C446.4,167.9,426.8,121.2,390.3,85.2z M357.1,335c-27.8,26.4-64.4,42.4-104.2,42.4c-81.2,0-147.1-65.9-147.1-147.1c0-81.2,65.9-147.1,147.1-147.1c38.7,0,74.4,15,101.1,41.7c26.7,26.7,41.7,62.4,41.7,101.1C398.8,272.2,382.9,308.8,357.1,335z"/>
    </svg>
);

// Hàm tiện ích để tìm kiếm không dấu và không phân biệt chữ hoa/thường
const normalizeText = (text) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Tách ký tự và dấu thành riêng biệt (e.g., 'á' -> 'a' + '´')
        .replace(/[\u0300-\u036f]/g, ''); // Loại bỏ các dấu
};


function ProjectsPage() {
    const { categoryId } = useParams();
    
    // State cho dữ liệu
    const [products, setProducts] = useState([]); // Lưu danh sách sản phẩm ĐÃ LỌC để hiển thị
    const [allProducts, setAllProducts] = useState([]); // Lưu danh sách sản phẩm GỐC (chưa lọc)
    const [sidebarCategories, setSidebarCategories] = useState([]);
    const [currentCategoryName, setCurrentCategoryName] = useState('Shop hoa');

    // State cho các bộ lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState([0, 500000]);
    const [maxPrice, setMaxPrice] = useState(500000);

    // State cho trạng thái loading
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const themeConfig = {
        // ... theme config giữ nguyên
    };

    const handleContactClick = (e, platform, product) => {
        e.preventDefault();
        console.log(`Đang chuyển đến ${platform} cho sản phẩm: ${product.name}`);
    };

    // Effect để TẢI DỮ LIỆU GỐC từ API khi categoryId thay đổi
    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingProducts(true);
            try {
                let rawProducts;
                let categoryDisplayName = 'Tất cả hoa';
                
                if (categoryId) {
                    const productObject = await getFlowersByCategoryId(categoryId);
                    rawProducts = productObject ? Object.values(productObject) : [];

                    const category = await getCategoryById(categoryId);
                    categoryDisplayName = category ? category.name : 'Không tìm thấy danh mục';
                } else {
                    rawProducts = await getListFlower();
                }

                const sanitizedProducts = rawProducts.map(product => ({
                    ...FlowerCategoryDTO,
                    ...product
                }));

                setAllProducts(sanitizedProducts);

                // Tự động tính giá cao nhất để cập nhật cho Slider
                if (sanitizedProducts.length > 0) {
                    const max = Math.max(...sanitizedProducts.map(p => p.price || 0));
                    const newMaxPrice = max > 0 ? max : 500000;
                    setMaxPrice(newMaxPrice);
                    setPriceRange([0, newMaxPrice]); // Reset khoảng giá về mặc định
                } else {
                    setMaxPrice(500000);
                    setPriceRange([0, 500000]);
                }

                setSearchTerm(''); // Reset ô tìm kiếm khi đổi danh mục
                setCurrentCategoryName(categoryDisplayName);
            } catch (error) {
                console.error("Lỗi khi tải danh sách hoa:", error);
                setAllProducts([]);
                setProducts([]);
                setCurrentCategoryName('Lỗi tải hoa');
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, [categoryId]);

    // Effect mới để LỌC DỮ LIỆU mỗi khi bộ lọc hoặc dữ liệu gốc thay đổi
    useEffect(() => {
        let productsToFilter = [...allProducts];

        // 1. Lọc theo tên (search term)
        if (searchTerm) {
            const normalizedSearch = normalizeText(searchTerm);
            productsToFilter = productsToFilter.filter(product => 
                normalizeText(product.name).includes(normalizedSearch)
            );
        }

        // 2. Lọc theo khoảng giá
        productsToFilter = productsToFilter.filter(product => 
            (product.price || 0) >= priceRange[0] && (product.price || 0) <= priceRange[1]
        );

        setProducts(productsToFilter); // Cập nhật danh sách để hiển thị
    }, [searchTerm, priceRange, allProducts]);


    // Effect để tải danh mục cho sidebar (Giữ nguyên)
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
            <style>{`
                /* ... CSS của bạn ... */
            `}</style>
            
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
                        <h2 style={{ color: '#4A634A', fontSize: '16px' }}>DANH MỤC</h2>
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
                    
                    {/* SEARCH BOXX */}
                    <div className='searchBox'>
                        <Card style={{ marginBottom: '20px' }}>
                            <Row gutter={[24, 24]} align="bottom">
                                <Col xs={24} md={12}>
                                    <Title level={5} style={{ margin: 0, marginBottom: '8px' }}>Tìm theo tên hoa</Title>
                                    <Input.Search
                                        placeholder="Nhập tên hoa..."
                                        allowClear
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </Col>
                                <Col xs={24} md={12}>
                                    <Title level={5} style={{ margin: 0, marginBottom: '8px' }}>Lọc theo khoảng giá</Title>
                                    <Slider
                                        range
                                        min={0}
                                        max={maxPrice}
                                        step={10000}
                                        value={priceRange}
                                        onChange={setPriceRange}
                                        tooltip={{ formatter: value => `${value?.toLocaleString('vi-VN')} đ` }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text type="secondary">{priceRange[0].toLocaleString('vi-VN')} đ</Text>
                                        <Text type="secondary">{priceRange[1].toLocaleString('vi-VN')} đ</Text>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </div>


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
                                        <p>Không có sản phẩm nào phù hợp.</p>
                                    </Col>
                                ) : (
                                    products.map((product) => (
                                        <Col key={product.id || product.name} xs={24} sm={12} md={8} lg={6}>
                                            <Link to={`/detail/${product.id}`}>
                                                <Card
                                                    hoverable
                                                    cover={<img alt={product.name} src={product.image} style={{ height: 200, objectFit: 'contain',borderBottom:'1px solid black',padding:2}} />}
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
                                                            color: '#4A634A',
                                                        }}>
                                                            {product.price ? product.price.toLocaleString('vi-VN') + ' đ' : 'Liên hệ'}
                                                        </span>
                                                        <Space>
                                                            <Button
                                                                shape="circle"
                                                                size="small"
                                                                onClick={(e) => handleContactClick(e, 'Zalo', product)}
                                                                icon={<Icon component={ZaloIcon} style={{ fontSize: '14px' }}/>}
                                                                style={{ backgroundColor: '#0068ff', color: 'white', borderColor: '#0068ff' }}
                                                                className="pulse-glow-effect"
                                                            />
                                                            <Button
                                                                shape="circle"
                                                                size="small"
                                                                icon={<TikTokOutlined />}
                                                                onClick={(e) => handleContactClick(e, 'TikTok', product)}
                                                                style={{ backgroundColor: '#222', color: 'white', borderColor: '#222' }}
                                                                className="pulse-glow-effect"
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