import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Row,
  Col,
  Menu,
  Carousel,
  Card,
  Typography,
  Button,
  Image,
  Spin,
  Avatar,
  Divider,
  Space,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  ShoppingCartOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { PromotionalPopup } from "../components/PromotionalPopup";
import { database } from "../firebaseConfig/firebase-config";
import {
  get,
  limitToLast,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  set,
} from "firebase/database";

// Import các hàm API cần thiết
import { getListFlower, getFlowersByStatus } from "../function/FlowerAPI";
import { getListCategory } from "../function/CategoryAPI";

const { Title, Text, Link, Paragraph } = Typography;
const { Meta } = Card;

const themeColors = {
  primary: "#255F38",
  primaryDark: "#18230F",
  accent: "#1F7D53",
  background: "#f8f9f8",
  lightGreenBg: "rgba(31, 125, 83, 0.05)",
};

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
    borderRadius: "8px",
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
    borderRadius: "50%",
    overflow: "hidden",
    marginBottom: "15px",
    border: "2px solid #fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  categoryCircleImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  categoryCircleLabel: {
    fontWeight: "bold",
    color: themeColors.primaryDark,
    textAlign: "center",
  },
  sideMenu: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    border: "1px solid #f0f0f0",
  },
  mainCarousel: {
    borderRadius: "8px",
    overflow: "hidden",
  },
  categoryProductsGrid: {
    marginTop: "40px",
  },
  // Đã bỏ overflow: "hidden" và height cố định ở đây
  categoryProductCard: {
    border: "1px solid #e8e8e8",
    borderRadius: "12px",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    // height: "auto", // Hoặc bỏ hoàn toàn để nó tự co giãn
  },
  categoryProductImageWrapper: {
    height: "220px",
    width: "100%",
    backgroundColor: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryProductImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  categoryProductInfo: {
    padding: "16px",
    flexGrow: 1, // Đảm bảo phần info chiếm hết không gian còn lại
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
  },
  productDescription: {
    color: "#8c8c8c",
    marginBottom: "10px",
  },
  productPrice: {
    color: themeColors.accent,
    fontWeight: "bold",
    fontSize: "18px",
  },
  mostPurchasedSection: {
    marginTop: "60px",
    backgroundColor: themeColors.lightGreenBg,
    padding: "40px 0",
  },
  sectionTitleContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    padding: "0 15px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sectionTitle: {
    color: themeColors.primaryDark,
    margin: 0,
    position: "relative",
    paddingLeft: "15px",
  },
  sectionTitleDecorator: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: "5px",
    height: "25px",
    backgroundColor: themeColors.primary,
    borderRadius: "3px",
  },
  purchasedProductCard: {
    textAlign: "center",
    border: "1px solid #e6e6e6",
    borderRadius: "8px",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
    margin: "0 8px",
  },
  purchasedProductPrice: {
    color: themeColors.primary,
    fontWeight: "bold",
    fontSize: "16px",
    margin: "10px 0",
  },
  addToCartButton: {
    backgroundColor: themeColors.primary,
    color: "#fff",
    fontWeight: "bold",
    width: "100%",
  },
};

const HomePage = () => {
  const { categoryMenuItems = [] } = useOutletContext();
  const [expanded, setExpanded] = useState(false);

  // Giới hạn chiều cao cho phần mô tả để card không bị quá dài ban đầu
  const descriptionStyle = expanded ? {} : { maxHeight: "60px", overflow: "hidden" };
  const [quickCategoriesData, setQuickCategoriesData] = useState([]);
  const [loadingQuickCategories, setLoadingQuickCategories] = useState(true);

  const [flowers, setFlowers] = useState([]);
  const [loadingFlowers, setLoadingFlowers] = useState(true);

  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingAvailableProducts, setLoadingAvailableProducts] = useState(true);

  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const featuredCarouselSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 992,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 576,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const fetchFlowers = () => {
    setLoadingFlowers(true);
    getListFlower()
      .then((loadedFlowers) => {
        setFlowers(loadedFlowers);
        setLoadingFlowers(false);
      })
      .catch((error) => {
        console.error("Lỗi khi đọc dữ liệu hoa từ Firebase:", error);
        setLoadingFlowers(false);
      });
  };

  const fetchAvailableProducts = async () => {
    setLoadingAvailableProducts(true);
    try {
      const productsWithStatus1 = await getFlowersByStatus(1);
      setAvailableProducts(productsWithStatus1);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm có sẵn tại shop:", error);
      setAvailableProducts([]);
    } finally {
      setLoadingAvailableProducts(false);
    }
  };

  const fetchQuickCategories = async () => {
    setLoadingQuickCategories(true);
    try {
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
  };

  const toggleDescription = (productId) => {
    setExpandedDescriptions((prevState) => ({
      ...prevState,
      [productId]: !prevState[productId],
    }));
  };

  useEffect(() => {
    fetchFlowers();
    fetchQuickCategories();
    fetchAvailableProducts();
  }, []);

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        {/* --- SECTION: GIAO HOA & DANH MỤC NHANH --- */}
        <div style={styles.quickCategoriesSection}>
          <Title level={3} style={styles.quickCategoriesTitle}>
            Giao hoa tận nơi các Quận, Huyện tại Cần Thơ
          </Title>
          <Title level={5} style={styles.quickCategoriesSubtitle}>
            Chuyên viên tư vấn: 0939 435 535 - 0902 641 567 (Tư vấn qua Zalo,
            Viber)
          </Title>
          {loadingQuickCategories ? (
            <Spin size="large" tip="Đang tải danh mục..." />
          ) : (
            <Row gutter={[16, 24]}>
              {quickCategoriesData.map((category, index) => (
                <Col key={index} xs={12} sm={8} md={4}>
                  <Link href={category.link} style={styles.categoryCircleLink}>
                    <div
                      style={styles.categoryCircleImageWrapper}
                      className="category-circle-hover"
                    >
                      <Image
                        src={category.img}
                        alt={category.label}
                        style={styles.categoryCircleImage}
                        fallback="https://via.placeholder.com/120?text=No+Image"
                        preview={false}
                      />
                    </div>
                    <Text style={styles.categoryCircleLabel}>
                      {category.label}
                    </Text>
                  </Link>
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* --- SẢN PHẨM CÓ SẴN TẠI SHOP (Lấy từ Firebase với status = 1) --- */}
        <div
          style={{
            marginTop: "50px",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <Title
              level={3}
              style={{
                color: themeColors.primary,
                margin: 0,
                borderLeft: `5px solid ${themeColors.accent}`,
                paddingLeft: "15px",
              }}
            >
              SẢN PHẨM CÓ SẴN TẠI SHOP
            </Title>
            <Link
              href="/projects"
              style={{ color: themeColors.accent, fontWeight: "500" }}
            >
              Xem tất cả <ArrowRightOutlined />
            </Link>
          </div>
          {loadingAvailableProducts ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" tip="Đang tải sản phẩm có sẵn..." />
            </div>
          ) : availableProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Text>Không có sản phẩm nào có sẵn tại shop.</Text>
            </div>
          ) : (
            <Carousel
              {...featuredCarouselSettings}
              className="featured-category-carousel"
            >
              {availableProducts.map((product) => (
                <div key={product.id} style={{ padding: "0 8px" }}>
                  <Card
                    style={{
                      width: 200,
                      display: "flex",
                      flexDirection: "column",
                      marginRight: 10,
                    }} // Thêm display flex để căn chỉnh nội dung bên trong
                    cover={
                      <Image
                        alt={product.name}
                        src={product.image}
                        preview={true}
                        style={{
                          objectFit: "contain",
                          height: 150,
                          borderBottom: "1px solid #e6e6e6",
                        }} // Đảm bảo ảnh có kích thước cố định
                      />
                    }
                  >
                    <Paragraph
                      style={{
                        marginTop: "auto",
                        fontSize: 16,
                        textAlign: "center",
                      }}
                    >
                      {" "}
                      {/* Sử dụng marginTop: 'auto' để đẩy xuống dưới cùng */}
                      {product.name}
                    </Paragraph>

                    <Paragraph
                      style={{
                        marginTop: "auto",
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "darkgreen",
                        textAlign: "center",
                      }}
                    >
                      {" "}
                      {/* Sử dụng marginTop: 'auto' để đẩy xuống dưới cùng */}
                      {product.price
                        ? Number(product.price).toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })
                        : "Liên hệ"}
                    </Paragraph>
                    <Button
                      style={{
                        backgroundColor: themeColors.primary,
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      XEM CHI TIẾT
                    </Button>
                  </Card>
                </div>
              ))}
            </Carousel>
          )}
        </div>

        {/* --- SECTION SẢN PHẨM LƯỚI (Lấy từ flowers state) --- */}
        <div style={styles.categoryProductsGrid}>
          {loadingFlowers ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" tip="Đang tải danh sách hoa..." />
            </div>
          ) : (
            <Row>
              {flowers.map((product) => (
                <Card
                  key={product.id} // Add a unique key here
                  style={{
                    width: 200,
                    display: "flex",
                    flexDirection: "column",
                    marginRight: 10,
                  }} // Thêm display flex để căn chỉnh nội dung bên trong
                  cover={
                    <Image
                      alt={product.name}
                      src={product.image}
                      preview={true}
                      style={{
                        objectFit: "contain",
                        height: 150,
                        borderBottom: "1px solid #e6e6e6",
                      }} // Đảm bảo ảnh có kích thước cố định
                    />
                  }
                >
                  <Paragraph
                    style={{
                      marginTop: "auto",
                      fontSize: 16,
                      textAlign: "center",
                    }}
                  >
                    {" "}
                    {/* Sử dụng marginTop: 'auto' để đẩy xuống dưới cùng */}
                    {product.name}
                  </Paragraph>

                  <Paragraph
                    style={{
                      marginTop: "auto",
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "darkgreen",
                      textAlign: "center",
                    }}
                  >
                    {" "}
                    {/* Sử dụng marginTop: 'auto' để đẩy xuống dưới cùng */}
                    {product.price
                      ? Number(product.price).toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      : "Liên hệ"}
                  </Paragraph>
                </Card>
              ))}
            </Row>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 991px) {
          .desktop-only-column { display: none !important; }
        }
        .slick-arrow {
            background-color: #fff !important;
            border: 1px solid #ddd;
            border-radius: 50%;
            color: #333 !important;
            z-index: 2;
            width: 30px;
            height: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            top: 50%;
            transform: translateY(-50%);
        }
        .slick-arrow:before {
            content: '';
        }
        .slick-prev {
            left: 10px;
        }
        .slick-next {
            right: 10px;
        }
        .slick-prev:before {
            content: '\\2039';
            font-size: 20px;
            color: #333;
        }
        .slick-next:before {
            content: '\\203A';
            font-size: 20px;
            color: #333;
        }
        .ant-menu-item-selected {
            background-color: ${themeColors.lightGreenBg} !important; color: ${themeColors.primary} !important; border-right: 3px solid ${themeColors.primary} !important;
        }
        .ant-menu-item-selected .ant-menu-item-icon { color: ${themeColors.primary} !important; }

        .category-circle-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }

        .featured-category-carousel {
            position: relative;
        }
        .featured-category-carousel .slick-slide > div {
            margin: 0 8px;
        }
        .featured-category-carousel .slick-list {
            margin: 0 -8px;
        }
      `}</style>

      {/* <PromotionalPopup/> */}
    </div>
  );
};

export default HomePage;