import React from "react";
import { Link } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import { formatPrice, normalizeImage } from "../function/dbUtils";

const FALLBACK = "https://placehold.co/400x400/eef4f2/0A7863?text=Hoa";

/** Thẻ sản phẩm: ảnh vuông có viền, tên 2 dòng, giá và nút "Đặt hoa". */
export default function ProductCard({ product }) {
  const image = normalizeImage(product.image) || FALLBACK;
  const to = `/detail/${product.id}`;
  return (
    <article className="product-card">
      <Link to={to} className="product-card__media" aria-label={product.name}>
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK;
          }}
        />
      </Link>
      <Link to={to} className="product-card__name">
        {product.name}
      </Link>
      <div className="product-card__price">{formatPrice(product.price)}</div>
      <Link to={to} className="btn-order">
        <span>Đặt hoa</span>
        <span className="btn-order__icon" aria-hidden="true">
          <PlusOutlined />
        </span>
      </Link>
    </article>
  );
}
