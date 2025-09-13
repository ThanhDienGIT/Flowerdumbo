import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Button,
  Image,
  Breadcrumb,
  Tag,
  Space,
  Spin,
  Alert,
  Divider,
} from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { getFlowerById } from "../function/FlowerAPI"; // <<< ĐẢM BẢO ĐƯỜNG DẪN NÀY ĐÚNG
import AppHeader from "../layouts/AppHeader";
import { Link as RouterLink } from "react-router-dom";
import { getListFlower, getFlowersByStatus } from "../function/FlowerAPI";
import JoditView from "../components/JoditView";
const { Title, Text, Paragraph } = Typography;

function DetailProjects() {
  const { detailId } = useParams();
  const [flowerDetails, setFlowerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingFlowers, setLoadingFlowers] = useState(true);
  const [filteredFlowers, setFilteredFlowers] = useState([]);
  const [allFlowers, setAllFlowers] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const fetchFlower = async () => {
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

  useEffect(() => {
    fetchFlower();
    const fetchFlowerDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getFlowerById(detailId);
        console.log(data);
        if (data) {
          setFlowerDetails(data);
        } else {
          setError("Không tìm thấy thông tin sản phẩm này.");
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết sản phẩm:", err);
        setError("Đã xảy ra lỗi khi tải sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (detailId) {
      fetchFlowerDetails();
    } else {
      setLoading(false);
      setError("Không có ID sản phẩm được cung cấp.");
    }
  }, [detailId]);

  // Các phần xử lý loading, error, và không có data được giữ nguyên
  if (loading) {
    return (
      <>
        <AppHeader />
        <div style={{ textAlign: "center", padding: "100px" }}>
          <Spin size="large" tip="Đang tải chi tiết sản phẩm..." />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AppHeader />
        <div
          style={{ maxWidth: "1100px", margin: "50px auto", padding: "32px" }}
        >
          <Alert message="Lỗi" description={error} type="error" showIcon />
        </div>
      </>
    );
  }

  const formatPriceWithMask = (price) => {
    if (!price || typeof price !== "number" || price <= 0) {
      return "Liên hệ";
    }
    // Sử dụng toLocaleString để định dạng số theo chuẩn Việt Nam
    return `${price.toLocaleString("vi-VN")} VND`;
  };

  // --- ĐÂY LÀ PRODUCT CARD ĐÃ ĐƯỢC CẬP NHẬT THEO YÊU CẦU CỦA BẠN ---
  const ProductCard = ({ product }) => (
    <RouterLink to={`/detail/${product.id}`} style={{ textDecoration: "none" }}>
      <div style={{ textAlign: "center" }}>
        {/* --- ẢNH SẢN PHẨM --- */}
        <Image
          alt={product.name}
          src={typeof(product.image)  == 'string' ? product.image : product.image.fileList[0].url}
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
          {/* --- TÊN SẢN PHẨM --- */}
          <Title
            level={5}
            style={{
              margin: "4px 0",
              fontSize: 16,
              fontWeight: 500,
              color: "#067862",
              // Thêm các thuộc tính để giới hạn text trong 2 dòng
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '48px', // Chiều cao tối thiểu cho 2 dòng
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

  if (!flowerDetails) {
    return (
      <>
        <AppHeader />
        <div
          style={{ maxWidth: "1100px", margin: "50px auto", padding: "32px" }}
        >
          <Alert
            message="Không tìm thấy"
            description="Sản phẩm bạn tìm kiếm không tồn tại."
            type="warning"
            showIcon
          />
        </div>
      </>
    );
  }

  const productFeatures = flowerDetails.description
    ? flowerDetails.description.split("\n")
    : [];

  return (
    <>
      <AppHeader />
      <div
        style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 24px" }}
      >
        <Row gutter={[48, 32]}>
          {/* CỘT BÊN TRÁI: HÌNH ẢNH SẢN PHẨM */}
          <Col xs={24} lg={12}>
            <Image
              src={typeof(flowerDetails.image) == 'string' ? flowerDetails.image : flowerDetails.image.fileList[0].url}
              alt={flowerDetails.name}
              style={{
                borderRadius: "8px",
                border: "1px solid #f0f0f0",
                width: "100%",
                aspectRatio: "1 / 1",
                objectFit: "cover",
              }}
            />
          </Col>
 
          {/* CỘT BÊN PHẢI: THÔNG TIN SẢN PHẨM */}
          <Col xs={24} lg={12}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Breadcrumb
                items={[
                  { title: <Link to="/">Trang chủ</Link> },
                  { title: flowerDetails.name },
                ]}
              />

              <Title level={2} style={{ margin: 0 }}>
                {flowerDetails.name}
              </Title>

              <Title level={1} style={{ color: "#0A7863", margin: "4px 0" }}>
                {flowerDetails.price > 0
                  ? flowerDetails.price.toLocaleString("vi-VN") + " VNĐ"
                  : "Liên hệ"}
              </Title>

              <div
                style={{
                  background: "#F9F9F9",
                  padding: "0px 8px",
                  borderRadius: "8px",
                }}
              >
                <Title level={4}>Mô tả sản phẩm</Title>
                <Space direction="vertical" align="start">
                  <JoditView htmlContent={flowerDetails.description} />
                </Space>
              </div>

              <div>
                <Title level={5}>
                  Tại sao nên đặt hoa tại Xưởng hoa của Kha?
                </Title>
                <Space direction="vertical" align="start">
                  <Text>
                    <CheckCircleOutlined
                      style={{ color: "#0A7863", marginRight: 8 }}
                    />{" "}
                    Chụp hình ảnh hoa thực tế trước khi giao
                  </Text>
                  <Text>
                    <CheckCircleOutlined
                      style={{ color: "#0A7863", marginRight: 8 }}
                    />{" "}
                    Giao hàng đúng giờ, đúng giấc nha
                  </Text>
                </Space>
              </div>

              <Button
                type="primary"
                size="large"
                block
                style={{ backgroundColor: "#0A7863", height: 50, fontSize: 18 }}
                href="https://zalo.me/0344278772" // <-- THAY SỐ ZALO CỦA BẠN
                target="_blank"
              >
                ĐẶT HOA
              </Button>
            </Space>
          </Col>
        </Row>
        <div>
          <Divider />
          <Title level={3} style={{ marginTop: 30, marginBottom: 24 }}>
            Các sản phẩm khác
          </Title>
          {loadingFlowers ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" tip="Đang tải danh sách hoa..." />
            </div>
          ) : (
            <Row gutter={[16, 24]} justify="start" align="top">
              {filteredFlowers.length > 0 ? (
                filteredFlowers.map((product) => (
                  <Col key={product.id} xs={12} sm={12} md={6} lg={6} xl={6}>
                    <ProductCard product={product} />
                  </Col>
                ))
              ) : (
                <Col span={24} style={{ textAlign: "center", padding: "40px" }}>
                  <Text>Không tìm thấy sản phẩm nào.</Text>
                </Col>
              )}
            </Row>
          )}
        </div>
      </div>
    </>
  );
}

export default DetailProjects;