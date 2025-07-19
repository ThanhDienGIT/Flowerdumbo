import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams
import { Row, Col, Typography, Button, Image, Divider, Space, Spin, Alert } from 'antd'; // Add Spin and Alert for loading/error
import { TikTokOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons'; // Import Icon for Zalo if using SVG

// Import your API function to get flower details by ID
import { getFlowerById } from '../function/FlowerAPI'; // <<< MAKE SURE THIS PATH IS CORRECT

const { Title, Paragraph } = Typography;

// =============================================================================
// ICON ZALO TÙY CHỈNH (copy từ ProjectsPage.js để đảm bảo có nếu chưa global)
// =============================================================================
const ZaloIcon = () => (
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="1em" height="1em" viewBox="0 0 460.1 436.2" fill="currentColor">
        <path d="M131.7,219.5h52.6v113.2h-52.6V219.5z M211.5,219.5h52.6v113.2h-52.6V219.5z M291.3,219.5h52.6v113.2h-52.6V219.5z M390.3,85.2C353.9,49.4,307,30,256,30c-52.1,0-99.8,19.9-136.6,56.6c-36.8,36.8-56.6,84.5-56.6,136.6c0,52.1,19.9,99.8,56.6,136.6c36.8,36.8,84.5,56.6,136.6,56.6c49.4,0,95-18.5,130.6-52.4c0,0,0,0,0,0c0.2-0.2,0.4-0.4,0.6-0.6c35.8-35.3,55.4-81.8,55.4-133.6C446.4,167.9,426.8,121.2,390.3,85.2z M357.1,335c-27.8,26.4-64.4,42.4-104.2,42.4c-81.2,0-147.1-65.9-147.1-147.1c0-81.2,65.9-147.1,147.1-147.1c38.7,0,74.4,15,101.1,41.7c26.7,26.7,41.7,62.4,41.7,101.1C398.8,272.2,382.9,308.8,357.1,335z"/>
    </svg>
);


function DetailProjects() {
  const { detailId } = useParams(); // Lấy flowerId từ URL

  const [flowerDetails, setFlowerDetails] = useState(null); // State để lưu chi tiết hoa
  const [loading, setLoading] = useState(true); // State cho trạng thái tải
  const [error, setError] = useState(null); // State cho lỗi

  // =============================================================================
  // CSS ĐỘNG CHO HIỆU ỨNG "NHỊP THỞ BONG BÓNG"
  // Giữ nguyên đoạn CSS animation bạn đã cung cấp
  // =============================================================================
  const breathingAnimationCSS = `
    /* Animation cho nút Zalo (màu xanh) */
    @keyframes breathing-zalo {
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(0, 104, 255, 0.7);
      }
      50% {
        transform: scale(1.1);
        box-shadow: 0 0 10px 15px rgba(0, 104, 255, 0);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(0, 104, 255, 0);
      }
    }

    .breathing-zalo {
      animation: breathing-zalo 2s infinite ease-out;
      transition: none !important; /* Đảm bảo không xung đột với Ant Design */
    }

    /* Animation cho nút TikTok (màu đen) */
    @keyframes breathing-tiktok {
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.5);
      }
      50% {
        transform: scale(1.1);
        box-shadow: 0 0 10px 15px rgba(0, 0, 0, 0);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
      }
    }

    .breathing-tiktok {
      animation: breathing-tiktok 2s infinite ease-out;
      transition: none !important; /* Đảm bảo không xung đột với Ant Design */
    }
  `;

  useEffect(() => {
    // Tự động thêm CSS animation vào thẻ <head> của trang
    const styleSheet = document.createElement("style");
    styleSheet.innerText = breathingAnimationCSS;
    document.head.appendChild(styleSheet);

    // Dọn dẹp khi component bị hủy
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, [breathingAnimationCSS]); // Thêm breathingAnimationCSS vào dependency array nếu nó có thể thay đổi

  useEffect(() => {
    const fetchFlowerDetails = async () => {
      setLoading(true);
      setError(null);
      try {

        const data = await getFlowerById(detailId);

        console.log(data)

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
  }, [detailId]); // Effect chạy lại khi flowerId thay đổi

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Đang tải chi tiết sản phẩm..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1100px', margin: '50px auto', padding: '32px' }}>
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!flowerDetails) {
    return (
      <div style={{ maxWidth: '1100px', margin: '50px auto', padding: '32px' }}>
        <Alert
          message="Không tìm thấy"
          description="Sản phẩm bạn tìm kiếm không tồn tại."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  // Nếu có dữ liệu, hiển thị chi tiết sản phẩm
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px' }}>
      <Row gutter={[32, 24]}>
        {/* CỘT BÊN TRÁI: HÌNH ẢNH SẢN PHẨM */}
        <Col xs={24} lg={12}>
          {/* Chỉ hiển thị một ảnh duy nhất từ flowerDetails.image */}
          <Image
            width="100%"
            src={flowerDetails.image || 'https://via.placeholder.com/400?text=No+Image'} // Fallback nếu không có ảnh
            alt={flowerDetails.name}
            style={{ borderRadius: '8px', objectFit: 'cover' }}
          />
          {/* Đã bỏ phần hiển thị danh sách ảnh nhỏ */}
        </Col>

        {/* CỘT BÊN PHẢI: THÔNG TIN SẢN PHẨM */}
        <Col xs={24} lg={12}>
          <Title level={3}>{flowerDetails.name}</Title>
          <Divider />
          <Paragraph type="secondary" style={{ fontSize: '15px' }}>
            {flowerDetails.description}
          </Paragraph>
          <Divider />
          <div style={{ margin: '16px 0', background: '#fafafa', padding: '16px', borderRadius: '8px' }}>
            <Title level={2} style={{ color: '#d0011b', margin: 0 }}>
              {flowerDetails.price ? flowerDetails.price.toLocaleString('vi-VN') + ' đ' : 'Liên hệ'}
            </Title>
          </div>

          <Paragraph style={{fontWeight: 500}}>Liên hệ đặt hàng qua:</Paragraph>
          <Space wrap>
            <Button
              className="breathing-zalo"
              size="large"
              style={{
                backgroundColor: '#0068ff',
                color: 'white',
                borderColor: '#0068ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight:'10px'
              }}
              shape="circle"
              onClick={() => console.log('Đặt qua Zalo cho sản phẩm', flowerDetails.name)}
              icon={<Icon component={ZaloIcon} style={{ fontSize: '20px' }} />}
            >
              {/* ZaloIcon đã được tích hợp bằng component Icon của Ant Design */}
            </Button>

            <Button
              className="breathing-tiktok"
              icon={<TikTokOutlined style={{ fontSize: '20px' }} />}
              size="large"
              style={{
                backgroundColor: '#222',
                color: 'white',
                borderColor: '#222',
              }}
              shape="circle"
              onClick={() => console.log('Mua trên TikTok cho sản phẩm', flowerDetails.name)}
            />
          </Space>
        </Col>
      </Row>
    </div>
  );
}

export default DetailProjects;