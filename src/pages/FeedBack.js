import React from 'react';
import { Row, Col, Typography, Card, Image, Button } from 'antd';
import AppHeader from '../layouts/AppHeader';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

// --- DỮ LIỆU MẪU ---
// Trong dự án thực tế, bạn sẽ lấy dữ liệu này từ API
const feedbackData = [
  {
    id: 1,
    mainImage: 'https://placehold.co/400x500/A8D8F8/333?text=Anh+Chinh',
    contextImage: 'https://placehold.co/400x300/A8D8F8/333?text=Anh+Phu',
  },
  {
    id: 2,
    mainImage: 'https://placehold.co/400x500/FFDDC1/333?text=Anh+Chinh',
    contextImage: 'https://placehold.co/400x300/FFDDC1/333?text=Anh+Phu',
  },
  {
    id: 3,
    mainImage: 'https://placehold.co/400x500/FFC3A0/333?text=Anh+Chinh',
    contextImage: 'https://placehold.co/400x300/FFC3A0/333?text=Anh+Phu',
  },
  {
    id: 4,
    mainImage: 'https://placehold.co/400x500/D4EDDA/333?text=Anh+Chinh',
    contextImage: 'https://placehold.co/400x300/D4EDDA/333?text=Anh+Phu',
  },
  {
    id: 5,
    mainImage: 'https://placehold.co/400x500/F8D7DA/333?text=Anh+Chinh',
    contextImage: 'https://placehold.co/400x300/F8D7DA/333?text=Anh+Phu',
  },
  {
    id: 6,
    mainImage: 'https://placehold.co/400x500/FFF3CD/333?text=Anh+Chinh',
    contextImage: 'https://placehold.co/400x300/FFF3CD/333?text=Anh+Phu',
  },
  {
    id: 7,
    mainImage: 'https://placehold.co/400x500/D1ECF1/333?text=Anh+Chinh',
    contextImage: 'https://placehold.co/400x300/D1ECF1/333?text=Anh+Phu',
  },
  {
    id: 8,
    mainImage: 'https://placehold.co/400x500/C3E6CB/333?text=Anh+Chinh',
    contextImage: 'https://placehold.co/400x300/C3E6CB/333?text=Anh+Phu',
  },
];

// --- HÌNH INFO ---
// Đây là hình ảnh thông tin màu xanh lá cây bên phải, bạn chỉ cần tạo 1 lần và dùng lại
// Bạn hãy tự tạo ảnh này và thay thế URL ở đây
const infoBlockImage = 'https://i.imgur.com/GfWCm2g.png'; 

// --- Component Card cho mỗi Feedback ---
const FeedbackCard = ({ item }) => {
  return (
    <Card
      style={{border:'none'}}
    >
            <Image src={item.mainImage} alt="Main" style={{ width: '100%', objectFit: 'contain', height: '100%',borderRadius:'15px' }} />
    </Card>
  );
};


function FeedBack() {
  return (
    <div>
       <AppHeader/>

    <div style={{ marginBottom: '24px' }}>
          <Link to="/">
            <Button size='large' style={{ margin: '16px', position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
              Về Trang Chủ
            </Button>
          </Link>
        </div>
    
    
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 24px' }}>
      {/* --- TIÊU ĐỀ --- */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2} style={{ color: '#333' }}>Hình ảnh thực tế</Title>
        <Text style={{ maxWidth: 700, margin: '0 auto', display: 'block', color: '#555' }}>
          Niềm vui của khách hàng cũng là niềm vui của Trạm Hoa. Chúng tôi luôn trân trọng những khoảnh khắc này cũng như là lời tri ân, cảm ơn chân thành đến quý khách đã tin tưởng sử dụng dịch vụ tặng hoa của Trạm.
        </Text>
      </div>

      {/* --- LƯỚI HÌNH ẢNH --- */}
      <Row gutter={[16, 16]}>
        {feedbackData.map(item => (
          <Col key={item.id} xs={12} sm={12} md={8} lg={6}>
            <FeedbackCard item={item} />
          </Col>
        ))}
      </Row>


        

    </div>
        </div>
  );
}

export default FeedBack;