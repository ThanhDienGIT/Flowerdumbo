import React from 'react';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import { FacebookOutlined, InstagramOutlined, TwitterOutlined, PushpinOutlined } from '@ant-design/icons'; // Using Pushpin for Pinterest as a placeholder

const { Footer: AntFooter } = Layout;
const { Title, Link, Text } = Typography;

const Footer = () => {
    return (
        <AntFooter style={{ 
            backgroundColor: '#e5f5e5', // Màu nền tương tự ảnh
            padding: 0, // Bỏ padding mặc định để kiểm soát nội dung
            position: 'relative', // Quan trọng cho phần sóng nếu thêm
            overflow: 'hidden' // Đảm bảo không tràn ra ngoài
        }}>
            {/* Phần sóng trên cùng và banner "Secret Savings here!" 
                Ant Design không có component nào làm được sóng này trực tiếp.
                Bạn sẽ cần CSS tùy chỉnh hoặc một hình ảnh SVG/PNG cho phần này.
                Ở đây, tôi sẽ mô phỏng bằng một div đơn giản.
            */}
            <div style={{
                backgroundColor: '#90ee90', // Màu xanh lá cây đậm hơn cho phần sóng
                height: 20, // Chiều cao của phần sóng
                // Để tạo hình sóng, bạn sẽ cần:
                // 1. Một hình ảnh SVG làm background: background: url('/path-to-wave.svg') no-repeat bottom center / 100% auto;
                // 2. Hoặc các kỹ thuật CSS phức tạp hơn (ví dụ: clip-path, pseudo-elements)
                // Tôi sẽ chỉ để màu nền phẳng ở đây vì yêu cầu "không cần CSS"
                position: 'relative',
                marginBottom: -40, // Đẩy lùi một phần vào nội dung dưới để tạo cảm giác chồng lấn
            }}>
                
            </div>

            <div style={{ padding: '60px 24px 24px', maxWidth: 1200, margin: '0 auto' }}>
                <Row gutter={[16, 32]} justify="center">
                    {/* Shop Matcha */}
                    <Col xs={24} sm={12} md={6}>
                        <Title level={5} style={{ color: '#4CAF50', marginBottom: 15 }}>Shop Matcha</Title>
                        <Space direction="vertical" size={10}>
                            <Link href="/starter-kits" style={{ color: '#555' }}>Starter Kits</Link>
                            <Link href="/lattes-sweetened" style={{ color: '#555' }}>Lattes & Sweetened</Link>
                            <Link href="/just-the-matcha" style={{ color: '#555' }}>Just the Matcha</Link>
                            <Link href="/matchaware" style={{ color: '#555' }}>Matchaware</Link>
                            <Link href="/shop-all" style={{ color: '#555' }}>Shop All</Link>
                        </Space>
                    </Col>

                    {/* Learn */}
                    <Col xs={24} sm={12} md={6}>
                        <Title level={5} style={{ color: '#4CAF50', marginBottom: 15 }}>Learn</Title>
                        <Space direction="vertical" size={10}>
                            <Link href="/our-story" style={{ color: '#555' }}>Our Story</Link>
                            <Link href="/matcha-recipes" style={{ color: '#555' }}>Matcha Recipes</Link>
                            <Link href="/caffeine-content" style={{ color: '#555' }}>Caffeine Content</Link>
                            <Link href="/health-benefits" style={{ color: '#555' }}>Health Benefits</Link>
                            <Link href="/faqs" style={{ color: '#555' }}>FAQ's</Link>
                        </Space>
                    </Col>

                    {/* More from Tenzo */}
                    <Col xs={24} sm={12} md={6}>
                        <Title level={5} style={{ color: '#4CAF50', marginBottom: 15 }}>More from Tenzo</Title>
                        <Space direction="vertical" size={10}>
                            <Link href="/sign-in" style={{ color: '#555' }}>Sign In</Link>
                            <Link href="/wholesale-opportunities" style={{ color: '#555' }}>Wholesale Opportunities</Link>
                            <Link href="/affiliate" style={{ color: '#555' }}>Affiliate</Link>
                            <Link href="/contact-us" style={{ color: '#555' }}>Contact Us</Link>
                        </Space>
                    </Col>

                    {/* Follow us */}
                    <Col xs={24} sm={12} md={6}>
                        <Title level={5} style={{ color: '#4CAF50', marginBottom: 15 }}>Follow us</Title>
                        <Space size="middle">
                            {/* Ant Design Icons */}
                            <Link href="https://pinterest.com/tenzotea" target="_blank" aria-label="Pinterest">
                                <div style={{ 
                                    backgroundColor: '#4CAF50', 
                                    borderRadius: '50%', 
                                    width: 35, 
                                    height: 35, 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center' 
                                }}>
                                    <PushpinOutlined style={{ fontSize: '18px', color: 'white' }} />
                                </div>
                            </Link>
                            <Link href="https://facebook.com/tenzotea" target="_blank" aria-label="Facebook">
                                <div style={{ 
                                    backgroundColor: '#4CAF50', 
                                    borderRadius: '50%', 
                                    width: 35, 
                                    height: 35, 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center' 
                                }}>
                                    <FacebookOutlined style={{ fontSize: '18px', color: 'white' }} />
                                </div>
                            </Link>
                            <Link href="https://instagram.com/tenzotea" target="_blank" aria-label="Instagram">
                                <div style={{ 
                                    backgroundColor: '#4CAF50', 
                                    borderRadius: '50%', 
                                    width: 35, 
                                    height: 35, 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center' 
                                }}>
                                    <InstagramOutlined style={{ fontSize: '18px', color: 'white' }} />
                                </div>
                            </Link>
                            <Link href="https://twitter.com/tenzotea" target="_blank" aria-label="Twitter">
                                <div style={{ 
                                    backgroundColor: '#4CAF50', 
                                    borderRadius: '50%', 
                                    width: 35, 
                                    height: 35, 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center' 
                                }}>
                                    <TwitterOutlined style={{ fontSize: '18px', color: 'white' }} />
                                </div>
                            </Link>
                        </Space>
                    </Col>
                </Row>

                <Divider style={{ borderColor: '#ddd', margin: '30px 0' }} />

                {/* Bottom Section */}
                <Row justify="space-between" align="middle" style={{ textAlign: 'center' }}>
                    <Col xs={24} md={12}>
                        <Text style={{ color: '#555', fontSize: '0.9em' }}>&copy; 2025 tenzotea.co</Text>
                    </Col>
                    <Col xs={24} md={12}>
                        <Space size="middle" wrap>
                            <Link href="/terms-of-service" style={{ color: '#555', fontSize: '0.9em' }}>Terms of Service</Link>
                            <Link href="/privacy-policy" style={{ color: '#555', fontSize: '0.9em' }}>Privacy Policy</Link>
                            <Link href="/refund-policy" style={{ color: '#555', fontSize: '0.9em' }}>Refund Policy</Link>
                            <Link href="/accessibility-policy" style={{ color: '#555', fontSize: '0.9em' }}>Accessibility Policy</Link>
                        </Space>
                    </Col>
                </Row>
            </div>
        </AntFooter>
    );
};

export default Footer;