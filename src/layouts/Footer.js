import React from "react";
import {
  Layout,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Image,
  Button,
} from "antd";
import {
  FacebookOutlined,
  TikTokOutlined
} from "@ant-design/icons";
import logo from "../assets/images/z6890559277656_f1ca855ae19bbf61771c9bdc47437271.jpg";
import feedback from "../assets/images/Green And White Illustrative Flower Shop Logo.png";
import blog from "../assets/images/hoa.png";
import { Link as RouterLink } from "react-router-dom";
import logoNoBackground from "../assets/images/Logo.pdf (6000 x 4000 px).png"
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
      <div
        style={{
          textAlign: "center",
          margin: "30px 0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {/* ================================================================== */}
        {/* PHẦN 1: TẠI SAO NÊN ĐẶT HOA TẠI XƯỞNG HOA CỦA KHA (Ảnh 2)         */}
        {/* ================================================================== */}
        <Typography
          style={{
            fontSize: "40px",
            marginBottom: 20,
            fontWeight: 600,
            color: "#0A7863",
            maxWidth: 1200,
          }}
        >
          FEEDBACK AND BLOG
        </Typography>
        <div style={{ width: "70%" }}>
          <Row gutter={[16, 24]}>
            <Col span={12}>
              <RouterLink to="/feedback">
                <Image
                  width={"100%"}
                  height={"250px"}
                  style={{
                    borderRadius: "50px",
                    aspectRatio: "1 / 1", // Giữ cho ảnh luôn có tỷ lệ 1:1 (vuông)
                    objectFit: "cover",
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
                height={"250px"}
                style={{
                  borderRadius: "50px",
                  aspectRatio: "1 / 1", // Giữ cho ảnh luôn có tỷ lệ 1:1 (vuông)
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                src={feedback} // <-- Ảnh minh họa (bạn có thể thay đổi)
                preview={false}
                alt="Tại sao nên chọn Xưởng hoa của Kha"
              />
            </Col>
          </Row>
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
                  src={logoNoBackground} // <-- THAY LOGO CỦA BẠN VÀO ĐÂY
                  preview={false}
                  alt="Logo Trạm Hoa"
                />
                <Text strong>Xưởng hoa’s Kha</Text>
                
                <Text>Thời gian làm việc: 08:30 - 22:30</Text>

                <Space size="middle">
                

                <Button
                  href="https://zalo.me/84843266691"
                  target="_blank"
                  rel="noopener noreferrer"
                  shape="circle"
                  style={{
                    backgroundColor: "#0068ff",
                    color: "white",
                    borderColor: "#0068ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                  }}
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/1024px-Icon_of_Zalo.svg.png"
                    width={20}
                    height={20}
                    alt=""
                  />
                </Button>
                  <Button
                  href="https://zalo.me/84843266691"
                  target="_blank"
                  rel="noopener noreferrer"
                  shape="circle"
                  style={{
                    backgroundColor: "#000000ff",
                    color: "white",
                    borderColor: "#0068ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                  }}
                >
                  <TikTokOutlined />
                </Button>
                </Space>
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
