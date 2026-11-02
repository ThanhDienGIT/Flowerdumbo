import React from "react";
import { NavLink } from "react-router-dom";
import { MenuOutlined, RightOutlined } from "@ant-design/icons";
import { Skeleton } from "antd";

/** Khung "DANH MỤC" bên trái: tiêu đề nền xanh + danh sách danh mục. */
export default function CategorySidebar({ categories, loading, title = "Danh mục", children }) {
  return (
    <nav className="cat-sidebar" aria-label="Danh mục hoa">
      <div className="cat-sidebar__title">
        <MenuOutlined /> {title}
      </div>
      {loading ? (
        <div style={{ padding: 16 }}>
          <Skeleton active paragraph={{ rows: 6 }} title={false} />
        </div>
      ) : (
        <ul className="cat-sidebar__list">
          {categories.map((cat) => (
            <li key={cat.id}>
              <NavLink
                to={`/projects/${cat.id}`}
                className={({ isActive }) => "cat-sidebar__item" + (isActive ? " is-active" : "")}
              >
                {cat.image ? (
                  <img src={cat.image} alt="" className="cat-sidebar__thumb" loading="lazy" />
                ) : (
                  <span className="cat-sidebar__thumb" />
                )}
                <span className="cat-sidebar__label">{cat.name}</span>
                <RightOutlined className="cat-sidebar__arrow" />
              </NavLink>
            </li>
          ))}
        </ul>
      )}
      {children}
    </nav>
  );
}
