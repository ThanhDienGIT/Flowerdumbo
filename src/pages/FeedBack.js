import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Card, Image, Button } from 'antd';
import AppHeader from '../layouts/AppHeader';
import { Link } from 'react-router-dom';
import {fectImage} from '../function/FeedBackAPI'
const { Title, Text } = Typography;

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
            <Image src={item.imgURL} alt="Main" style={{ width: '100%', objectFit: 'cover', height: '300px',borderRadius:'10px',aspectRatio: "1 / 1", }} />
    </Card>
  );
};


function FeedBack() {

  const [listImage,setListImage] = useState([])

const getAPI = async () => {
    const data = await fectImage()
    
    await setListImage(data)

  }
  useEffect(()=>{
    getAPI()
  },[]) 

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
          Niềm vui của khách hàng cũng là niềm vui của Xưởng Hoa's của Kha. Chúng tôi luôn trân trọng những khoảnh khắc này cũng như là lời tri ân, cảm ơn chân thành đến quý khách đã tin tưởng sử dụng dịch vụ tặng hoa của Xưởng.
        </Text>
      </div>

      {/* --- LƯỚI HÌNH ẢNH --- */}
      <Row gutter={[16, 16]}>
        {listImage.map(item => (
          <Col key={item.id} xs={12} sm={12} md={12} lg={6}>
            <FeedbackCard item={item} />
          </Col>
        ))}
      </Row>


        

    </div>
        </div>
  );
}

export default FeedBack;