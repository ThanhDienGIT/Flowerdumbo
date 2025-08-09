import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Row,
  Col,
  Carousel,
  Card,
  Typography,
  Button,
  Image,
  Spin,
  Divider,
  Input,   // Đã thêm
  Slider,  // Đã thêm
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  TikTokOutlined,
  ShoppingCartOutlined,
  BorderBottomOutlined,
} from "@ant-design/icons";
import { getListFlower, getFlowersByStatus } from "../function/FlowerAPI";
import { getListCategory } from "../function/CategoryAPI";

const { Title, Text, Paragraph } = Typography;

const themeColors = {
  primary: "#255F38",
  primaryDark: "#18230F",
  accent: "#1F7D53",
  background: "#f8f9f8",
  lightGreenBg: "rgba(31, 125, 83, 0.05)",
};

// --- STYLES OBJECT (Giữ nguyên) ---
const styles = {
  pageContainer: {
    backgroundColor: themeColors.background,
  },
  contentWrapper: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px 15px",
  },
  quickCategoriesSection: {
    textAlign: "center",
    padding: "30px 15px",
    backgroundColor: "#eaf2ec",
    marginBottom: "30px",
  },
  quickCategoriesTitle: {
    color: themeColors.primaryDark,
    fontWeight: "bold",
  },
  quickCategoriesSubtitle: {
    color: themeColors.accent,
    fontSize: "16px",
    fontWeight: "500",
    marginBottom: "25px",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  categoryCircleLink: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: themeColors.primaryDark,
  },
  categoryCircleImageWrapper: {
    width: "120px",
    height: "120px",
    overflow: "hidden",
    marginBottom: "15px",
    border: "2px solid #fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  categoryCircleImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  categoryCircleLabel: {
    fontWeight: "bold",
    color: themeColors.primaryDark,
    textAlign: "center",
  },
  categoryProductsGrid: {
    padding: "20px",
    marginTop:'20px',
  },
  productCard: {
    width: "100%",
    backgroundColor: "#fff",
    border: "1px solid #e3e3e3",
    borderRadius: '8px',
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    height: '100%', // Đảm bảo card có chiều cao đầy đủ
  },
  productImage: {
    padding:'20px',
    width: '100%',
    height:'200px',
    objectFit: "contain",
    transition: 'transform 0.3s ease',
    border:"1px solid black"
  },
  productInfo: {
    padding: "10px",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    textAlign: "left",
  },
  productName: {
    color: '#424242',
    fontWeight: "500",
    marginBottom: "10px",
    height: '3.2em',
    lineHeight: '1.6em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    webkitBoxOrient: 'vertical',
    webkitLineClamp: '2',
  },
  productFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  productPrice: {
    color: themeColors.accent,
    fontSize: "16px",
    fontWeight: 'bold',
    margin: 0,
  },
  addToCartButton: {
    backgroundColor: themeColors.primary,
    color: '#fff',
    border: 'none',
  },
};

// --- HÀM HỖ TRỢ TÌM KIẾM ---
const normalizeText = (text) => {
  if (!text) return '';
  return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
};


// --- COMPONENT ---
const HomePage = () => {
  const [quickCategoriesData, setQuickCategoriesData] = useState([]);
  const [loadingQuickCategories, setLoadingQuickCategories] = useState(true);
  
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingAvailableProducts, setLoadingAvailableProducts] = useState(true);
  
  // State cho TẤT CẢ SẢN PHẨM và BỘ LỌC
  const [allFlowers, setAllFlowers] = useState([]);
  const [filteredFlowers, setFilteredFlowers] = useState([]);
  const [loadingFlowers, setLoadingFlowers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [maxPrice, setMaxPrice] = useState(1000000);


  const featuredCarouselSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } },
    ],
    prevArrow: <LeftOutlined className="slick-arrow slick-prev" />,
    nextArrow: <RightOutlined className="slick-arrow slick-next" />,
  };

  useEffect(() => {
    const fetchAllData = async () => {
      // Tải danh mục nhanh
      try {
        setLoadingQuickCategories(true);
        const data = await getListCategory();
        const formattedCategories = data.map((cat) => ({
          id: cat.id,
          img: cat.image,
          label: cat.name.toUpperCase(),
          link: `/projects/${cat.id}`,
        }));
        setQuickCategoriesData(formattedCategories);
      } catch (error) {
        console.error("Lỗi khi tải danh mục nhanh:", error);
      } finally {
        setLoadingQuickCategories(false);
      }

      // Tải sản phẩm có sẵn
      try {
        setLoadingAvailableProducts(true);
        const productsWithStatus1 = await getFlowersByStatus(1);
        setAvailableProducts(productsWithStatus1);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm có sẵn tại shop:", error);
      } finally {
        setLoadingAvailableProducts(false);
      }

      // Tải TẤT CẢ SẢN PHẨM
      try {
        setLoadingFlowers(true);
        const flowersData = await getListFlower();
        setAllFlowers(flowersData);
        setFilteredFlowers(flowersData);
        
        if (flowersData.length > 0) {
            const max = Math.max(...flowersData.map(p => p.price || 0));
            const newMaxPrice = max > 0 ? max : 1000000;
            setMaxPrice(newMaxPrice);
            setPriceRange([0, newMaxPrice]);
        }

      } catch (error) {
        console.error("Lỗi khi đọc dữ liệu hoa từ Firebase:", error);
      } finally {
        setLoadingFlowers(false);
      }
    };

    fetchAllData();
  }, []);
  
  // useEffect để LỌC TẤT CẢ SẢN PHẨM
  useEffect(() => {
    let tempFlowers = [...allFlowers];

    if (searchTerm) {
        const normalizedSearch = normalizeText(searchTerm);
        tempFlowers = tempFlowers.filter(product => 
            normalizeText(product.name).includes(normalizedSearch)
        );
    }

    tempFlowers = tempFlowers.filter(product =>
        (product.price || 0) >= priceRange[0] && (product.price || 0) <= priceRange[1]
    );
    
    setFilteredFlowers(tempFlowers);

  }, [searchTerm, priceRange, allFlowers]);


  // --- Reusable Product Card Component ---
  const ProductCard = ({ product }) => (
    <RouterLink to={`/detail/${product.id}`} style={{ display: 'block', height: '100%' }}>
        <Card
            hoverable
            style={styles.productCard}
            cover={
                <Image
                    alt={product.name}
                    src={product.image}
                    preview={false}
                    style={styles.productImage}
                    className="product-image-hover-effect"
                    fallback="https://placehold.co/220x220/ffffff/c0c0c0?text=No+Image"
                />
            }
            bodyStyle={{ padding: 0, display: 'flex', flexGrow: 1 }}
        >
            <div style={styles.productInfo}>
                <Paragraph style={styles.productName} title={product.name}>
                    {product.name}
                </Paragraph>
                <div style={styles.productFooter}>
                    <Paragraph style={styles.productPrice}>
                        {product.price
                            ? Number(product.price).toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                            })
                            : "Liên hệ"}
                    </Paragraph>
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<ShoppingCartOutlined />}
                        style={styles.addToCartButton}
                        onClick={(e) => {
                            e.preventDefault();
                            console.log("Add to cart:", product.name);
                        }}
                    />
                </div>
            </div>
        </Card>
    </RouterLink>
  );


  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        {/* --- SECTION: GIAO HOA & DANH MỤC NHANH --- */}
        <div style={styles.quickCategoriesSection}>
            <Title level={2} style={styles.quickCategoriesTitle}>
              GIAO HOA TẬN NƠI TẠI KHU VỰC CẦN THƠ
            </Title>
            <div style={styles.quickCategoriesSubtitle}>
              <Typography>Gọi cho shop: 0843.266.691 hoặc liên hệ qua</Typography>
              <Button href="https://zalo.me/84843266691" target="_blank" rel="noopener noreferrer" style={{backgroundColor: themeColors.accent, color: 'white'}}>Zalo</Button>
              <Button href="https://www.tiktok.com/@xng.hoa.online" target="_blank" rel="noopener noreferrer" style={{backgroundColor:"black",color:'white'}} icon={<TikTokOutlined />} />
            </div>
            {loadingQuickCategories ? (
              <div style={{ textAlign: "center", padding: "50px" }}><Spin size="large" tip="Đang tải danh mục..." /></div>
            ) : (
              <Row gutter={[16, 24]}>
                {quickCategoriesData.map((category) => (
                  <Col key={category.id} xs={12} sm={8} md={4}>
                    <RouterLink to={category.link} style={styles.categoryCircleLink}>
                      <div style={styles.categoryCircleImageWrapper} className="category-circle-hover">
                        <Image src={category.img} alt={category.label} style={styles.categoryCircleImage} fallback="https://placehold.co/120x120/eaf2ec/255F38?text=Image" preview={false} />
                      </div>
                      <Text style={styles.categoryCircleLabel}>{category.label}</Text>
                    </RouterLink>
                  </Col>
                ))}
              </Row>
            )}
        </div>

        {/* --- SẢN PHẨM CÓ SẴN TẠI SHOP --- */}
        <div style={{ marginTop: "50px", backgroundColor: "#eaf2ec", padding: "20px", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <Title level={3} style={{ color: themeColors.primary, margin: 0, borderLeft: `5px solid ${themeColors.accent}`, paddingLeft: "15px" }}>
              SẢN PHẨM CÓ SẴN TẠI SHOP
            </Title>
          </div>
          {loadingAvailableProducts ? (
            <div style={{ textAlign: "center", padding: "50px" }}><Spin size="large" tip="Đang tải sản phẩm có sẵn..." /></div>
          ) : availableProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px" }}><Text>Không có sản phẩm nào có sẵn tại shop.</Text></div>
          ) : (
            <Carousel {...featuredCarouselSettings} className="featured-category-carousel">
              {availableProducts.map((product) => (
                <div key={product.id} style={{padding: '5px'}}>
                  <ProductCard product={product} />
                </div>
              ))}
            </Carousel>
          )}
        </div>

        {/* --- SECTION TẤT CẢ SẢN PHẨM --- */}
        <div style={styles.categoryProductsGrid}>
          <Title style={{ color: themeColors.primary, textAlign:'center', margin: 0, paddingLeft: "15px", marginBottom:'20px' }}>
            Tất cả sản phẩm
          </Title>
          <Divider style={{borderTop:'2px solid #389234ff'}} />
          
          {/* Searchbox */}
          <div className="searchBox">
            <Card style={{ marginBottom: '25px', background: '#fff', border: '1px solid #e8e8e8' }}>
                <Row gutter={[24, 24]} align="bottom">
                    <Col xs={24} md={12}>
                        <Text strong>Tìm theo tên hoa</Text>
                        <Input.Search
                            placeholder="Nhập tên hoa bạn muốn tìm..."
                            allowClear
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{marginTop: '8px'}}
                            size="large"
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <Text strong>Lọc theo khoảng giá</Text>
                        <Slider
                            range
                            min={0}
                            max={maxPrice}
                            step={10000}
                            value={priceRange}
                            onChange={setPriceRange}
                            tooltip={{ formatter: value => `${value?.toLocaleString('vi-VN')} đ` }}
                            style={{marginTop: '8px', marginBottom: 0}}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-5px' }}>
                            <Text type="secondary">{priceRange[0].toLocaleString('vi-VN')} đ</Text>
                            <Text type="secondary">{priceRange[1].toLocaleString('vi-VN')} đ</Text>
                        </div>
                    </Col>
                </Row>
            </Card>
          </div>
          
          {loadingFlowers ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" tip="Đang tải danh sách hoa..." />
            </div>
          ) : (
            <Row gutter={[24, 32]}>
              {filteredFlowers.length > 0 ? (
                filteredFlowers.map((product) => (
                  <Col key={product.id} xs={12} sm={12} md={8} lg={6}>
                      <ProductCard product={product} />
                  </Col>
                ))
              ) : (
                <Col span={24} style={{ textAlign: 'center', padding: '40px'}}>
                    <Text>Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</Text>
                </Col>
              )}
            </Row>
          )}
        </div>
      </div>

      <style>{`
        .slick-arrow {
            background-color: #fff !important;
            border: 1px solid #ddd;
            border-radius: 50%;
            color: #333 !important;
            z-index: 2;
            width: 40px;
            height: 40px;
            display: flex !important;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            top: 50%;
            transform: translateY(-50%);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
        }
        .slick-arrow:hover {
            background-color: ${themeColors.accent} !important;
            color: #fff !important;
            border-color: ${themeColors.accent};
        }
        .slick-arrow:before { content: ''; }
        .slick-prev { left: -10px; }
        .slick-next { right: -10px; }
        .slick-prev .anticon, .slick-next .anticon { font-size: 18px; color: inherit; }
        .category-circle-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }
        .featured-category-carousel {
            position: relative;
            margin: 0 -12px;
        }
        .featured-category-carousel .slick-list {
            padding: 5px 0;
        }
        .featured-category-carousel .slick-slide > div {
            padding: 0 12px;
        }
        .ant-card-hoverable:hover .product-image-hover-effect {
            transform: scale(1.08);
        }
      `}</style>
    </div>
  );
};

export default HomePage;