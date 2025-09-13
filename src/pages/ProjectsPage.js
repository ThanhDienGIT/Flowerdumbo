import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  Layout,
  Card,
  Row,
  Col,
  Breadcrumb,
  ConfigProvider,
  Button,
  Space,
  Spin,
  Input,
  Radio,
  Checkbox,
  Typography,
  Divider,
  Select,
  Image,
  Slider,
} from "antd"; // Thêm Image và Slider vào import
import { TikTokOutlined } from "@ant-design/icons";
import Icon from "@ant-design/icons";

// Import API functions
import { getFlowersByCategoryId, getListFlower } from "../function/FlowerAPI";
import {
  getCategoryById,
  getFlowerClassifications,
} from "../function/CategoryAPI";

// Import DTO để đảm bảo cấu trúc dữ liệu
import FlowerCategoryDTO from "../DTO/FlowerCategoryDTO";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// =============================================================================
// ICON ZALO TÙY CHỈNH (Giữ nguyên)
// =============================================================================
const ZaloIcon = () => (
  <svg
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width="1em"
    height="1em"
    viewBox="0 0 460.1 436.2"
    fill="currentColor"
  >
    <path d="M131.7,219.5h52.6v113.2h-52.6V219.5z M211.5,219.5h52.6v113.2h-52.6V219.5z M291.3,219.5h52.6v113.2h-52.6V219.5z M390.3,85.2C353.9,49.4,307,30,256,30c-52.1,0-99.8,19.9-136.6,56.6c-36.8,36.8-56.6,84.5-56.6,136.6c0,52.1,19.9,99.8,56.6,136.6c36.8,36.8,84.5,56.6,136.6,56.6c49.4,0,95-18.5,130.6-52.4c0,0,0,0,0,0c0.2-0.2,0.4-0.4,0.6-0.6c35.8-35.3,55.4-81.8,55.4-133.6C446.4,167.9,426.8,121.2,390.3,85.2z M357.1,335c-27.8,26.4-64.4,42.4-104.2,42.4c-81.2,0-147.1-65.9-147.1-147.1c0-81.2,65.9-147.1,147.1-147.1c38.7,0,74.4,15,101.1,41.7c26.7,26.7,41.7,62.4,41.7,101.1C398.8,272.2,382.9,308.8,357.1,335z" />
  </svg>
);

// =============================================================================
// HÀM TIỆN ÍCH (Giữ nguyên và bổ sung)
// =============================================================================
const normalizeText = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// HÀM MỚI: Định dạng giá tiền
const formatPriceWithMask = (price) => {
  if (price === undefined || price === null) return "Liên hệ";
  return price.toLocaleString("vi-VN") + " đ";
};

// =============================================================================
// COMPONENT CARD SẢN PHẨM MỚI
// =============================================================================
const ProductCard = ({ product }) => (
  <Link to={`/detail/${product.id}`} style={{ textDecoration: "none" }}>
    <div style={{ textAlign: "center" }}>
      {/* --- ẢNH SẢN PHẨM --- */}
      <Image
        alt={product.name}
        src={
          typeof product.image == "string"
            ? product.image
            : product.image.fileList[0].url
        }
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          height: "250px",
          objectFit: "cover",
          borderRadius: 8,
          border: "1px solid #e2e2e2ff",
        }}
        // Để có hiệu ứng hover, bạn cần thêm CSS cho class này trong file CSS của mình
        // ví dụ: .product-image-hover-effect:hover { transform: scale(1.05); transition: transform 0.3s; }
        className="product-image-hover-effect"
        preview={false}
      />

      <div style={{ padding: "8px 4px" }}>
        {/* --- MÃ SẢN PHẨM (cần có dữ liệu product.code) --- */}
        {/* <Text style={{ fontSize: 14, color: '#00d084' }}>{product.code}</Text> */}

        {/* --- TÊN SẢN PHẨM --- */}
        <Title
          level={5}
          style={{
            margin: "4px 0",
            fontSize: 16,
            fontWeight: 500,
            color: "#067862",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
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
          {/* Giá gốc (cần có dữ liệu product.originalPrice) */}
          {product.originalPrice && (
            <Text delete style={{ color: "#585858ff", fontSize: 14 }}>
              {formatPriceWithMask(product.originalPrice)}
            </Text>
          )}
          {/* Giá bán */}
          <Text
            style={{ color: "#5f5f5fff", fontSize: 16, fontWeight: "bold" }}
          >
            {formatPriceWithMask(product.price)}
          </Text>
        </div>
      </div>
    </div>
  </Link>
);

// =============================================================================
// COMPONENT CHÍNH CỦA TRANG
// =============================================================================
function ProjectsPage() {
  const { categoryId } = useParams();

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll lên đầu trang (x=0, y=0)
  }, [pathname]);

  // State cho dữ liệu
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [currentCategoryName, setCurrentCategoryName] = useState("Shop hoa");
  const [sort, setSort] = useState("thapcao");
  // State cho các bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 4000000]); // Mặc định toàn bộ range

  // State cho trạng thái loading
  const [loadingProducts, setLoadingProducts] = useState(true);

  const themeConfig = {
    // ... theme config giữ nguyên
  };

  const fetchAll = async () => {
    try {
      const productObject = await getFlowerClassifications(categoryId);
      console.log(productObject);
      setLoadingProducts(false);
      setProducts(productObject.filter((x) => x.categoryId == categoryId));
      setAllProducts(productObject);
    } catch (err) {
      setLoadingProducts(false);
      console.log(err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    console.log("run");

    var arrayFilter = [];

    if (categoryId) {
      arrayFilter = allProducts.filter((x) => x.categoryId == categoryId);
    }

    // Lọc theo giá với thanh kéo
    arrayFilter = arrayFilter.filter((x) => {
      return (
        x.price >= selectedPriceRange[0] && x.price <= selectedPriceRange[1]
      );
    });

    if (searchTerm.length > 0) {
      arrayFilter = arrayFilter.filter((x) => {
        return normalizeText(x.name).includes(normalizeText(searchTerm));
      });
    }

    if (sort == "thapcao") {
      arrayFilter = arrayFilter.sort((a, b) => a.price - b.price);
    } else {
      arrayFilter = arrayFilter.sort((a, b) => b.price - a.price);
    }

    setProducts(arrayFilter);
  }, [categoryId, selectedPriceRange, searchTerm, sort]);

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
        <Layout style={{ padding: "0 16px 16px", backgroundColor: "#fff" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>
              <Link to="/">Trang chủ</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/projects">Bộ sưu tập</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{currentCategoryName}</Breadcrumb.Item>
          </Breadcrumb>

          {/* Phần tiêu đề */}
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0 }}>
                {currentCategoryName}
              </Title>
            </Col>
          </Row>
          {/* Phần filter mới: Dạng ngang, responsive */}
          <Row gutter={[16, 24]} >
            <Col xs={24} md={3}>
              <Title level={5} style={{ marginBottom: 4 }}>
                Sắp xếp
              </Title>
              <Select
                value={sort}
                onChange={(e) => {
                  setSort(e);
                }}
                style={{ width: "100%" }}
              >
                <Option value="thapcao">Giá: Thấp đến cao</Option>
                <Option value="caothap">Giá: Cao đến thấp</Option>
              </Select>
            </Col>

            <Col xs={24} md={4}>
              <Title level={5} style={{ marginBottom: 4 }}>
                Tìm theo tên
              </Title>
              <Input.Search
                placeholder="Nhập tên hoa..."
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col xs={24} md={4}>
              <Title level={5} style={{ marginBottom: 4 }}>
                Mức giá (VND)
              </Title>
              <Slider
                range
                min={0}
                max={4000000}
                step={100000}
                defaultValue={[0, 4000000]}
                value={selectedPriceRange}
                onChange={(value) => setSelectedPriceRange(value)}
                marks={{
                  0: "0",
                  4000000: "4.000.000",
                }}
                tipFormatter={(value) => formatPriceWithMask(value)}
              />
            </Col>
          </Row>
          <Divider />
          <Content style={{ minHeight: 280 }}>
            {loadingProducts ? (
              <div style={{ textAlign: "center", padding: "50px" }}>
                <Spin size="large" tip="Đang tải sản phẩm..." />
              </div>
            ) : (
              <Row gutter={[16, 24]}>
                {products.length == 0 ? (
                  <Col
                    span={24}
                    style={{ textAlign: "center", padding: "50px" }}
                  >
                    <p>Không có sản phẩm nào phù hợp với tiêu chí của bạn.</p>
                  </Col>
                ) : (
                  products.map((product, index) => (
                    // THAY THẾ CARD CŨ BẰNG ProductCard MỚI
                    <Col key={index} xs={12} sm={12} md={4} lg={4}>
                      <ProductCard product={product} />
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
