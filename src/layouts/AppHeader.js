import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { Input, Button } from "antd";
import { MenuOutlined, PhoneOutlined, MessageOutlined } from "@ant-design/icons";
import logo from "../assets/images/z6890559277656_f1ca855ae19bbf61771c9bdc47437271.jpg";
import useCatalog from "../hooks/useCatalog";
import { contact } from "../theme/theme";

/**
 * Header 3 tầng:
 *  1. Thanh trên (xanh đậm): khu vực, giờ làm việc, mạng xã hội
 *  2. Logo + ô tìm kiếm + hotline + nút đặt hoa
 *  3. Menu danh mục (xanh) + sọc trang trí xanh/cam
 */
const AppHeader = ({ onMenuClick }) => {
  const { categories } = useCatalog();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get("q") || "");

  useEffect(() => {
    setKeyword(params.get("q") || "");
  }, [params]);

  const onSearch = (value) => {
    const q = value.trim();
    navigate(q ? `/projects?q=${encodeURIComponent(q)}` : "/projects");
  };

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="shop-container topbar__inner">
          <span>Xưởng Hoa's Kha · Shop hoa online {contact.area}</span>
          <span className="topbar__links">
            <span>Giờ làm việc: {contact.hours}</span>
            <a href={contact.zaloUrl} target="_blank" rel="noopener noreferrer">Zalo</a>
            <a href={contact.tiktokUrl} target="_blank" rel="noopener noreferrer">TikTok</a>
            <Link to="/feedback">Phản hồi khách hàng</Link>
          </span>
        </div>
      </div>

      <div className="shop-container mainbar__inner">
        <Button
          className="mainbar__menu-btn"
          icon={<MenuOutlined />}
          aria-label="Mở menu"
          onClick={onMenuClick}
          size="large"
        />
        <Link to="/" className="mainbar__logo" aria-label="Xưởng Hoa's Kha - Trang chủ">
          <img src={logo} alt="Xưởng Hoa's Kha" />
        </Link>
        <div className="mainbar__search">
          <Input.Search
            size="large"
            placeholder="Tìm hoa theo tên…"
            allowClear
            enterButton
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={onSearch}
          />
        </div>
        <a className="mainbar__hotline" href={contact.zaloUrl} target="_blank" rel="noopener noreferrer">
          <PhoneOutlined />
          <span>
            <strong>{contact.zaloLabel}</strong>
            <small>từ {contact.hours}</small>
          </span>
        </a>
        <a className="mainbar__cta" href={contact.zaloUrl} target="_blank" rel="noopener noreferrer">
          <MessageOutlined /> Đặt hoa qua Zalo
        </a>
      </div>

      <nav className="mainnav" aria-label="Danh mục chính">
        <div className="shop-container">
          <ul className="mainnav__list">
            <li>
              <NavLink to="/" end className={({ isActive }) => "mainnav__link" + (isActive ? " is-active" : "")}>
                Trang chủ
              </NavLink>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <NavLink
                  to={`/projects/${cat.id}`}
                  className={({ isActive }) => "mainnav__link" + (isActive ? " is-active" : "")}
                >
                  {cat.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="nav-stripe" />
    </header>
  );
};

export default AppHeader;
