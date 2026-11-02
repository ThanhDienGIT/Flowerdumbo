import React from "react";
import { Link } from "react-router-dom";
import { TikTokOutlined, MessageOutlined, ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import blog from "../assets/images/hoa.png";
import logoNoBackground from "../assets/images/Logo.pdf (6000 x 4000 px).png";
import useCatalog from "../hooks/useCatalog";
import { contact } from "../theme/theme";

const Footer = () => {
  const { categories } = useCatalog();

  return (
    <>
      <section className="shop-container" aria-labelledby="footer-feedback-title">
        <div className="page-section">
          <div className="section-head">
            <h2 id="footer-feedback-title" className="section-title">Phản hồi từ khách hàng</h2>
            <Link to="/feedback" className="section-link">Xem tất cả →</Link>
          </div>
          <Link to="/feedback" className="footer-feedback">
            <img src={blog} alt="Phản hồi từ khách hàng của Xưởng Hoa's Kha" loading="lazy" />
          </Link>
        </div>
      </section>

      <footer className="site-footer">
        <div className="shop-container site-footer__grid">
          <div>
            <img src={logoNoBackground} alt="Xưởng Hoa's Kha" className="site-footer__logo" />
            <p style={{ margin: "14px 0 6px", fontWeight: 600, color: "#fff" }}>Xưởng hoa's Kha</p>
            <p style={{ margin: 0 }}>Shop hoa online</p>
            <div className="site-footer__social">
              <a href={contact.zaloUrl} target="_blank" rel="noopener noreferrer" aria-label="Zalo">
                <MessageOutlined />
              </a>
              <a href={contact.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <TikTokOutlined />
              </a>
            </div>
          </div>

          <div>
            <h3>Danh mục</h3>
            <ul>
              {categories.slice(0, 8).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/projects/${cat.id}`}>{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Hỗ trợ khách hàng</h3>
            <ul>
              <li><a href={contact.zaloUrl} target="_blank" rel="noopener noreferrer">Đặt hoa qua Zalo</a></li>
              <li><Link to="/feedback">Phản hồi khách hàng</Link></li>
              <li><Link to="/projects">Tất cả sản phẩm</Link></li>
            </ul>
          </div>

          <div>
            <h3>Liên hệ</h3>
            <ul>
              <li><MessageOutlined /> Zalo: {contact.zaloLabel}</li>
              <li><TikTokOutlined /> TikTok: {contact.tiktokLabel}</li>
              <li><ClockCircleOutlined /> Giờ làm việc: {contact.hours}</li>
              <li><EnvironmentOutlined /> {contact.area}</li>
            </ul>
          </div>
        </div>
        <div className="site-footer__bottom">Developer 2025 © CyberTrust</div>
      </footer>
    </>
  );
};

export default Footer;
