import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';

export function PromotionalPopup() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Logic để hiển thị popup khi vào trang
  useEffect(() => {
    // Giả sử popup hiển thị sau 1.5 giây
    const timer = setTimeout(() => setIsModalVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsModalVisible(false);
  };

  return (
    <Modal
        open={isModalVisible}
        onCancel={handleClose}
        
        // --- Các thuộc tính quan trọng để "cắt viền" ---
        footer={null}      // Bỏ chân modal
        closable={false}   // Bỏ nút 'X' mặc định
        centered           // Căn giữa màn hình
        width={550}        // Chiều rộng của ảnh
        maskClosable={true}  // Cho phép nhấn ra ngoài để đóng

        // Đây là phần "phép thuật": làm cho khung modal trong suốt
        styles={{
          body: { 
            padding: 0, 
            background: 'transparent', // Nền của body trong suốt
          },
          content: { 
            background: 'transparent', // Nền của content trong suốt
            boxShadow: 'none',       // Bỏ đổ bóng
          },
        }}
    >
        {/* Nội dung bên trong chỉ đơn giản là hình ảnh PNG của bạn */}
        <a href="/trang-khuyen-mai">
            <img 
                src="https://thienminhtech.com/assets/front/img/product/featured/62526f2f46fb1.jpg" // Đặt đường dẫn đến file PNG của bạn ở đây
                alt="Chương trình khuyến mãi" 
                style={{ width: '100%' }}
            />
        </a>
    </Modal>
  );
}