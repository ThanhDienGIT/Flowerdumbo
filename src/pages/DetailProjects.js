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
    <svg 
        width="1em" 
        height="1em" 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Phần nền màu xanh của logo */}
        <path 
            d="M40 28.8519C40 12.9178 27.0822 0 11.1481 0H7.14815C3.1933 0 0 3.1933 0 7.14815V11.1481C0 27.0822 12.9178 40 28.8519 40H32.8519C36.8067 40 40 36.8067 40 32.8519V28.8519Z" 
            fill="#0068FF"
        />
        {/* Phần chữ Z màu trắng */}
        <path 
            d="M19.9959 18.0085L13.1228 24.8816H25.7533C26.5861 24.8816 27.2713 25.5668 27.2713 26.3996C27.2713 27.2324 26.5861 27.9176 25.7533 27.9176H11.2402C10.8238 27.9176 10.426 27.7523 10.1299 27.4562C9.83377 27.1601 9.66846 26.7623 9.66846 26.3459C9.66846 25.9295 9.83377 25.5317 10.1299 25.2356L17.0029 18.3626L11.7582 18.3626C10.9254 18.3626 10.2402 17.6774 10.2402 16.8446C10.2402 16.0118 10.9254 15.3266 11.7582 15.3266H26.7574C27.1738 15.3266 27.5716 15.4919 27.8677 15.788C28.1638 16.0841 28.3291 16.4819 28.3291 16.8983C28.3291 17.3147 28.1638 17.7125 27.8677 18.0085H19.9959Z" 
            fill="white"
        />
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
            src={flowerDetails.image || 'https://via.placeholder.com/400?text=No+Image'} // Fallback nếu không có ảnh
            alt={flowerDetails.name}
            style={{ borderRadius: '8px', objectFit: 'contain'}}
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
              shape='circle'
              href="https://zalo.me/84843266691"
              target="_blank"
            >
              {/* ZaloIcon đã được tích hợp bằng component Icon của Ant Design */}
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/1024px-Icon_of_Zalo.svg.png" width={25} height={25} alt=''/>
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
              href="https://www.tiktok.com/@xng.hoa.online"
              target="_blank"
            />
          </Space>
        </Col>
      </Row>
    </div>
  );
}

export default DetailProjects;