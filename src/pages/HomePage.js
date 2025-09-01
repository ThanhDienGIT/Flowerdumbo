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
  Input,
  Slider,
  FloatButton,
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

// --- CẬP NHẬT GIAO DIỆN: Style cho card vuông và nhỏ gọn ---
const styles = {
  pageContainer: {
    backgroundColor: themeColors.background,
  },
  contentWrapper: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0px 30px",
  },
  quickCategoriesSection: {
    marginTop: "30px",
    textAlign: "center",
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  categoryCircleLink: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: themeColors.primaryDark,
  },
  categoryCircleImageWrapper: {
    width: "150px",
    height: "150px",
    overflow: "hidden",
    marginBottom: "15px",
    border: "2px solid #fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    borderRadius: "100%",
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
    padding: "10px 0", // Giảm padding
    marginTop: "20px",
  },
  productCard: {
    width: "100%",
    border: "none",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  productImage: {
    width: "100%",
    aspectRatio: "1 / 1", // Tỷ lệ vuông
    objectFit: "cover", // Hiển thị toàn bộ ảnh
    transition: "transform 0.3s ease",
    padding: "5px", // Thêm một chút padding để ảnh không bị dính sát viền
  },
  productInfo: {
    padding: "8px", // Giảm padding của phần text
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    textAlign: "left",
  },
  productName: {
    color: "#424242",
    fontWeight: "500",
    marginBottom: "8px",
    fontSize: "13px", // Giảm cỡ chữ tên
    height: "2.8em", // Điều chỉnh chiều cao cho 2 dòng
    lineHeight: "1.4em",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    webkitBoxOrient: "vertical",
    webkitLineClamp: "2",
  },
  productFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  productPrice: {
    color: themeColors.accent,
    fontSize: "14px", // Giảm cỡ chữ giá
    fontWeight: "bold",
    margin: 0,
  },
  addToCartButton: {
    backgroundColor: themeColors.primary,
    color: "#fff",
    border: "none",
    height: "28px", // Thu nhỏ nút
    width: "28px",
  },
};
// --- KẾT THÚC CẬP NHẬT STYLE ---

const normalizeText = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Sửa regex để chỉ xóa dấu
    .replace(/đ/g, "d"); // Thêm dòng này để xử lý chữ "đ"
};

const formatPriceWithMask = (price) => {
  if (!price || typeof price !== "number" || price <= 0) {
    return "Liên hệ";
  }
  const formattedPrice = Number(price).toLocaleString("vi-VN");
  const firstDigit = formattedPrice.charAt(0);
  const restOfString = formattedPrice.substring(1);
  return `${firstDigit}${restOfString} VND`;
};

// --- COMPONENT ---
const HomePage = () => {
  const [quickCategoriesData, setQuickCategoriesData] = useState([]);
  const [loadingQuickCategories, setLoadingQuickCategories] = useState(true);

  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingAvailableProducts, setLoadingAvailableProducts] =useState(true);

  const [allFlowers, setAllFlowers] = useState([]);
  const [filteredFlowers, setFilteredFlowers] = useState([]);
  const [loadingFlowers, setLoadingFlowers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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

      try {
        setLoadingAvailableProducts(true);
        const productsWithStatus1 = await getFlowersByStatus(1);
        setAvailableProducts(productsWithStatus1);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm có sẵn tại shop:", error);
      } finally {
        setLoadingAvailableProducts(false);
      }

      try {
        setLoadingFlowers(true);
        const flowersData = await getListFlower();
        setAllFlowers(flowersData);
        setFilteredFlowers(flowersData);

        if (flowersData.length > 0) {
          const max = Math.max(...flowersData.map((p) => p.price || 0));
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

  useEffect(() => {
    let tempFlowers = [...allFlowers];

    if (searchTerm) {
      const normalizedSearch = normalizeText(searchTerm);
      tempFlowers = tempFlowers.filter((product) =>
        normalizeText(product.name).includes(normalizedSearch)
      );
    }

    tempFlowers = tempFlowers.filter(
      (product) =>
        (product.price || 0) >= priceRange[0] &&
        (product.price || 0) <= priceRange[1]
    );

    setFilteredFlowers(tempFlowers);
  }, [searchTerm, priceRange, allFlowers]);

  const ProductCard = ({ product }) => (
    <RouterLink to={`/detail/${product.id}`} style={{ textDecoration: "none" }}>
      <div style={{ textAlign: "center" }}>
        {/* --- ẢNH SẢN PHẨM --- */}
        {/* Sử dụng aspectRatio để ảnh luôn vuông và responsive */}
        <Image
          alt={product.name}
          src={product.image}
          style={{
            width: "100%",
            aspectRatio: "1 / 1", // Giữ cho ảnh luôn có tỷ lệ 1:1 (vuông)
            objectFit: "cover",
            borderRadius: 8, // Bo góc nhẹ cho đẹp hơn
            border: "1px solid #e2e2e2ff",
          }}
          className="product-image-hover-effect"
          preview={false} // Ẩn icon preview khi hover
        />

        <div style={{ padding: "8px 4px" }}>
          {/* --- MÃ SẢN PHẨM --- */}
          {/* Bạn cần thêm thuộc tính 'code' vào object product */}
          {/* <Text style={{ fontSize: 14, color: '#00d084' }}>{product.code}</Text> */}

          {/* --- TÊN SẢN PHẨM --- */}
          <Title
            level={5}
            style={{
              margin: "4px 0",
              fontSize: 16,
              fontWeight: 500,
              color: "#067862",
            }}
          >
            {product.name}
          </Title>

          {/* --- HIỂN THỊ GIÁ --- */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "baseline",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            {/* Giá gốc (nếu có) */}
            {/* Bạn cần thêm thuộc tính 'originalPrice' vào object product */}
            {product.originalPrice && (
              <Text delete style={{ color: "#585858ff", fontSize: 14 }}>
                {formatPriceWithMask(product.originalPrice)}
              </Text>
            )}
            {/* Giá mới (giá bán) */}
            <Text
              style={{ color: "#5f5f5fff", fontSize: 16, fontWeight: "bold" }}
            >
              {formatPriceWithMask(product.price)}
            </Text>
          </div>
        </div>
      </div>
    </RouterLink>
  );

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        <div class="banner">
          <img
            src="https://dienhoasaigon.com.vn/wp-content/uploads/2022/03/banner-web_shop-hoa9x-01-scaled.jpg"
            alt="Banner"
            style={{ width: "100%", borderRadius: "8px", objectFit: "cover" }}
          />
        </div>

        <div style={styles.quickCategoriesSection}>
          {loadingQuickCategories ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" tip="Đang tải danh mục..." />
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {quickCategoriesData.map((category) => (
                <Col key={category.id} xs={12} sm={8} md={4}>
                  <RouterLink
                    to={category.link}
                    style={styles.categoryCircleLink}
                  >
                    <div
                      style={styles.categoryCircleImageWrapper}
                      className="category-circle-hover"
                    >
                      <Image
                        src={category.img}
                        alt={category.label}
                        style={styles.categoryCircleImage}
                        fallback="https://placehold.co/120x120/eaf2ec/255F38?text=Image"
                        preview={false}
                      />
                    </div>
                    <Text style={styles.categoryCircleLabel}>
                      {category.label}
                    </Text>
                  </RouterLink>
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* <div style={{ marginTop: "50px", backgroundColor: "#eaf2ec", padding: "20px", position: "relative" }}>
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
        </div> */}

        <div style={styles.categoryProductsGrid}>
          <Title
            style={{
              color: themeColors.primary,
              textAlign: "center",
              margin: 0,
              paddingLeft: "15px",
              marginBottom: "20px",
            }}
          >
            HOA TƯƠI NHÀ KHA
          </Title>
          <div className="searchBox">
            <Card
              style={{
                marginBottom: "25px",
                background: "#fff",
                border: "1px solid #e8e8e8",
              }}
            >
              <Row gutter={[24, 24]} align="bottom">
                <Col xs={24} md={12}>
                  <Text strong>Tìm theo tên hoa</Text>
                  <Input.Search
                    placeholder="Nhập tên hoa bạn muốn tìm..."
                    allowClear
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginTop: "8px" }}
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
                    tooltip={{
                      formatter: (value) =>
                        `${value?.toLocaleString("vi-VN")} đ`,
                    }}
                    style={{ marginTop: "8px", marginBottom: 0 }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "-5px",
                    }}
                  >
                    <Text type="secondary">
                      {priceRange[0].toLocaleString("vi-VN")} đ
                    </Text>
                    <Text type="secondary">
                      {priceRange[1].toLocaleString("vi-VN")} đ
                    </Text>
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
            // --- CẬP NHẬT: Giảm khoảng cách (gutter) để card dày hơn ---
            <Row gutter={[16, 24]} justify="start" align="top">
              {filteredFlowers.length > 0 ? (
                filteredFlowers.map((product) => (
                  // --- CẬP NHẬT: 4 cột trên mọi kích thước màn hình ---
                  <Col key={product.id} xs={12} sm={12} md={6} lg={6} xl={6}>
                    <ProductCard product={product} />
                  </Col>
                ))
              ) : (
                <Col span={24} style={{ textAlign: "center", padding: "40px" }}>
                  <Text>Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</Text>
                </Col>
              )}
            </Row>
          )}
        </div>

        <FloatButton
          target="_blank"
          size="large"
          icon={<TikTokOutlined style={{ fontSize: 20 }} />}
          style={{
            width: 50,
            height: 50,
            right: 30,
            bottom: 30,
            backgroundColor: themeColors.primary,
          }}
          visibilityHeight={200}
          tooltip={<div>Đi đến Tiktok</div>}
          href="https://www.tiktok.com/@xng.hoa.online"
        />

        <FloatButton
          size="large"
          target="_blank"
          icon={
            <div>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/2048px-Icon_of_Zalo.svg.png"
                width={20}
                height={20}
                alt=""
              />
            </div>
          }
          tooltip={<div>Đi đến Zalo</div>}
          style={{
            width: 50,
            height: 50,
            right: 30,
            bottom: 100,
            backgroundColor: "blue",
          }}
          visibilityHeight={200}
          href="https://zalo.me/84843266691"
        />
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
