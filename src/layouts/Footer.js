import React from "react";
import { Layout, Row, Col, Typography, Space, Divider, Image } from "antd";
import {
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  TwitterOutlined,
  PushpinOutlined,
  CheckCircleOutlined,
  CarOutlined,
  CameraOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import logo from "../assets/images/z6890559277656_f1ca855ae19bbf61771c9bdc47437271.jpg";
import feedback from "../assets/images/Green And White Illustrative Flower Shop Logo.png";
import blog from "../assets/images/hoa.png";
import { Link as RouterLink } from "react-router-dom";
// --- Placeholder cho icon TikTok và Zalo vì antd không có sẵn ---
// Bạn có thể dùng SVG để thay thế
const TikTokIcon = () => (
  <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
    <path d="M208,80v80a48.05,48.05,0,0,1-48,48H152a8,8,0,0,1-8-8V115.65A40,40,0,1,0,112,88v50.48a8,8,0,0,1-5.48,7.59l-.1.05a8,8,0,0,1-8.34-6.32A40,40,0,1,0,64,128a39.43,39.43,0,0,0,2.35,13.62A8,8,0,0,1,64.1,148l-.09.1a8,8,0,0,1-9.7-5.47A56,56,0,1,1,112,168v32a64.07,64.07,0,0,0,64-64V88a8,8,0,0,1,16,0Z"></path>
  </svg>
);

const { Footer: AntFooter } = Layout;
const { Title, Link, Text } = Typography;

// --- Component cho mỗi mục trong phần "Tại sao..." ---
const ReasonItem = ({ icon, title, description }) => (
  <Col xs={12} md={6} style={{ textAlign: "center", padding: "10px" }}>
    <div style={{ color: "#0A7863", fontSize: "48px", marginBottom: "16px" }}>
      {icon}
    </div>
    <Text
      strong
      style={{ display: "block", fontSize: "16px", color: "#0A7863" }}
    >
      {title}
    </Text>
    <Text style={{ fontSize: "14px", color: "#555" }}>{description}</Text>
  </Col>
);

// --- Component cho mỗi bước trong "Quy trình đặt hoa" ---
const OrderStep = ({ number, children }) => (
  <Col xs={24} md={12} lg={8} style={{ padding: "10px 20px" }}>
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      <div
        style={{
          marginRight: "16px",
          color: "#0A7863",
          border: "2px solid #0A7863",
          borderRadius: "50%",
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          flexShrink: 0,
        }}
      >
        {number}
      </div>
      <Text style={{ color: "#333", fontSize: "15px" }}>{children}</Text>
    </div>
  </Col>
);

const Footer = () => {
  return (
    <AntFooter
      style={{
        backgroundColor: "#F9F9F9",
        padding: "40px 0",
        borderTop: "1px solid #E8E8E8",
      }}
    >
      <div style={{ textAlign: "center", margin: "30px 0",display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column' }}>
        {/* ================================================================== */}
        {/* PHẦN 1: TẠI SAO NÊN ĐẶT HOA TẠI XƯỞNG HOA CỦA KHA (Ảnh 2)         */}
        {/* ================================================================== */}
        <div style={{ maxWidth: 1200 }}>
          <Typography
            style={{
              fontSize: "40px",
              marginBottom: 20,
              fontWeight: 600,
              color: "#0A7863",
            }}
          >
            FEEDBACK AND BLOG
          </Typography>
          <Row gutter={[16, 24]}>
            <Col span={12}>
              <RouterLink to="/feedback">
              <Image
                width={"100%"}
                height={"200px"}
                style={{
                  borderRadius: "50px",
                  aspectRatio: "1 / 1", // Giữ cho ảnh luôn có tỷ lệ 1:1 (vuông)
                  objectFit: "contain",
                  cursor: "pointer",
                }}
                src={blog} // <-- Ảnh minh họa (bạn có thể thay đổi)
                preview={false}
                alt="Tại sao nên chọn Xưởng hoa của Kha"
              />
              </RouterLink>
            </Col>

            <Col span={12}>
              <Image
                width={"100%"}
                height={"200px"}
                style={{
                  borderRadius: "50px",
                  aspectRatio: "1 / 1", // Giữ cho ảnh luôn có tỷ lệ 1:1 (vuông)
                  objectFit: "contain",  cursor: "pointer",
                }}
                src={feedback} // <-- Ảnh minh họa (bạn có thể thay đổi)
                preview={false}
                alt="Tại sao nên chọn Xưởng hoa của Kha"
              />
            </Col>
          </Row>
          <Divider style={{ margin: "40px 0" }} />

          <Title level={2} style={{ color: "#E57399", marginBottom: "40px" }}>
            Tại sao nên đặt hoa tại Xưởng hoa của Kha?
          </Title>
          <Row gutter={[16, 24]}>
            <ReasonItem
              icon={<CheckCircleOutlined />}
              title="Hình Hoa Thật"
              description="Gửi hình hoa trước khi giao"
            />
            <ReasonItem
              icon={<CarOutlined />}
              title="Giao Hoa đúng giờ"
              description="Giao hoa đúng giờ, đúng hẹn"
            />
            <ReasonItem
              icon={<CameraOutlined />}
              title="Ảnh Xác Nhận"
              description="Gửi hình ảnh sau khi giao hoa"
            />
            <ReasonItem
              icon={<CreditCardOutlined />}
              title="Thanh Toán chuyển khoản"
              description="Quý khách vui lòng đặt cọc trước 50% giá trị đơn hàng"
            />
          </Row>
        </div>

        <Divider />

        {/* ================================================================== */}
        {/* PHẦN 2: QUY TRÌNH ĐẶT HOA (Nội dung mới)                         */}
        {/* ================================================================== */}
        <div style={{ textAlign: "center", margin: "40px 0",display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column' }}>
          <div style={{maxWidth:1200}}>   
          <Title level={3} style={{ color: "#0A7863", marginBottom: "30px" }}>
            Quy trình đặt hoa
          </Title>
          <Row gutter={[16, 24]} justify="center">
            <OrderStep number="1">Chọn mẫu hoa ưng ý của quý khách.</OrderStep>
            <OrderStep number="2">
              Chụp ảnh mẫu lại và liên hệ qua Zalo, Tiktok.
            </OrderStep>
            <OrderStep number="3">
              Gửi ảnh và thông tin cá nhân: Họ tên, SĐT, Ngày/giờ & địa chỉ
              giao, Lời nhắn (nếu có).
            </OrderStep>
            <OrderStep number="4">
              Shop sẽ tiếp nhận yêu cầu và phản hồi nhanh chóng.
            </OrderStep>
            <OrderStep number="5">
              Giao hoa tận tay người nhận và gửi ảnh xác nhận.
            </OrderStep>
          </Row>
          </div>
        </div>

        <Divider />

        {/* ================================================================== */}
        {/* PHẦN 3: FOOTER CHÍNH (Ảnh 1)                                     */}
        {/* ================================================================== */}
        <div style={{}}>
          <Row gutter={[100, 36]}>
            {/* --- CỘT 1: THÔNG TIN CÔNG TY --- */}
            <Col xs={24} sm={12} lg={8}>
              <Space direction="vertical" size="middle">
                <Image
                  width={250}
                  src={logo} // <-- THAY LOGO CỦA BẠN VÀO ĐÂY
                  preview={false}
                  alt="Logo Trạm Hoa"
                />
                <Text strong>XƯỞNG HOA CỦA KHA</Text>
                <Text>SĐT: 0843.266.691</Text>
                <Text>Email: tramhoavn@gmail.com</Text>
                <Text>Thời gian làm việc: 07:30 - 18:30</Text>

                <Space size="middle">
                  <Link
                    href="#"
                    target="_blank"
                    style={{ fontSize: 22, color: "#333" }}
                  >
                    <FacebookOutlined />
                  </Link>
                  <Link
                    href="#"
                    target="_blank"
                    style={{ fontSize: 22, color: "#333" }}
                  >
                    <InstagramOutlined />
                  </Link>
                  <Link
                    href="#"
                    target="_blank"
                    style={{ fontSize: 22, color: "#333" }}
                  >
                    <TikTokIcon />
                  </Link>
                  <Link
                    href="#"
                    target="_blank"
                    style={{ fontSize: 22, color: "#333" }}
                  >
                    <YoutubeOutlined />
                  </Link>
                  <Link
                    href="#"
                    target="_blank"
                    style={{ fontSize: 22, color: "#333" }}
                  >
                    <TwitterOutlined />
                  </Link>
                </Space>
              </Space>
            </Col>

            {/* --- CỘT 2: LIÊN KẾT HỮU ÍCH --- */}
            <Col xs={24} sm={12} lg={8}>
              <Title level={5}>LIÊN KẾT HỮU ÍCH</Title>
              <Space direction="vertical" align="start">
                <Link href="/gioi-thieu" style={{ color: "#555" }}>
                  Giới thiệu
                </Link>
                <Link href="/lien-he" style={{ color: "#555" }}>
                  Liên hệ
                </Link>
                <Link href="/faq" style={{ color: "#555" }}>
                  Câu hỏi thường gặp (FAQs)
                </Link>
                <Link href="/huong-dan-dat-hoa" style={{ color: "#555" }}>
                  Hướng dẫn đặt hoa
                </Link>
                <Link href="/doi-tac" style={{ color: "#555" }}>
                  Đối tác tiêu biểu
                </Link>
                <Link href="/hinh-anh-danh-gia" style={{ color: "#555" }}>
                  Hình ảnh thực tế / Đánh giá
                </Link>
                <Link href="/blog" style={{ color: "#555" }}>
                  Blog - Chuyện về hoa
                </Link>
              </Space>
            </Col>

         
            {/* --- CỘT 4: DANH MỤC SẢN PHẨM --- */}
            <Col xs={24} sm={12} lg={8}>
              <Title level={5}>DANH MỤC SẢN PHẨM</Title>
              <Space direction="vertical" align="start">
                <Link href="/hoa-sinh-nhat" style={{ color: "#555" }}>
                  <PushpinOutlined
                    style={{ marginRight: 8, color: "#0A7863" }}
                  />
                  Hoa Sinh Nhật
                </Link>
                <Link href="/hoa-khai-truong" style={{ color: "#555" }}>
                  <PushpinOutlined
                    style={{ marginRight: 8, color: "#0A7863" }}
                  />
                  Hoa Khai Trương
                </Link>
                <Link href="/hoa-chia-buon" style={{ color: "#555" }}>
                  <PushpinOutlined
                    style={{ marginRight: 8, color: "#0A7863" }}
                  />
                  Hoa Chia Buồn
                </Link>
                <Link href="/ke-hoa-chuc-mung" style={{ color: "#555" }}>
                  <PushpinOutlined
                    style={{ marginRight: 8, color: "#0A7863" }}
                  />
                  Kệ Hoa Chúc Mừng
                </Link>
                <Link href="/bo-hoa" style={{ color: "#555" }}>
                  <PushpinOutlined
                    style={{ marginRight: 8, color: "#0A7863" }}
                  />
                  Bó Hoa
                </Link>
                <Link href="/gio-hoa" style={{ color: "#555" }}>
                  <PushpinOutlined
                    style={{ marginRight: 8, color: "#0A7863" }}
                  />
                  Giỏ Hoa
                </Link>
                <Link href="/chau-lan-ho-diep" style={{ color: "#555" }}>
                  <PushpinOutlined
                    style={{ marginRight: 8, color: "#0A7863" }}
                  />
                  Chậu Lan Hồ Điệp
                </Link>
              </Space>
            </Col>
          </Row>

          <Divider style={{ margin: "30px 0" }} />

          {/* --- COPYRIGHT --- */}
          <div style={{ textAlign: "center" }}>
            <Text>Developer 2025 © CyberTrust</Text>
          </div>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;
