import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Breadcrumb, Image, Skeleton, Empty } from "antd";
import { fectImage } from "../function/FeedBackAPI";

/** Trang "Hình ảnh thực tế" – ảnh phản hồi của khách hàng. */
function FeedBack() {
  const [listImage, setListImage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fectImage()
      .then((data) => alive && setListImage(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Lỗi tải ảnh phản hồi:", err))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="shop-container">
      <Breadcrumb
        style={{ margin: "16px 0 0" }}
        items={[{ title: <Link to="/">Trang chủ</Link> }, { title: "Phản hồi khách hàng" }]}
      />
      <section className="page-section" aria-labelledby="feedback-title">
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 28px" }}>
          <h1 id="feedback-title" className="section-title" style={{ fontSize: 24 }}>Hình ảnh thực tế</h1>
          <p style={{ color: "#555", lineHeight: 1.6, marginTop: 10 }}>
            Niềm vui của khách hàng cũng là niềm vui của Xưởng Hoa's của Kha. Chúng tôi luôn trân trọng những
            khoảnh khắc này cũng như là lời tri ân, cảm ơn chân thành đến quý khách đã tin tưởng sử dụng dịch vụ
            tặng hoa của Xưởng.
          </p>
        </div>

        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton.Image key={i} active style={{ width: "100%", height: "auto", aspectRatio: "1 / 1" }} />
            ))}
          </div>
        ) : listImage.length === 0 ? (
          <Empty description="Chưa có hình ảnh phản hồi." />
        ) : (
          <Image.PreviewGroup>
            <div className="product-grid">
              {listImage.map((item, i) => (
                <div key={item.id ?? i} className="product-card__media">
                  <Image
                    src={item.imgURL}
                    alt={`Phản hồi khách hàng ${i + 1}`}
                    width="100%"
                    height="100%"
                    style={{ objectFit: "cover" }}
                    rootClassName="feedback-img"
                  />
                </div>
              ))}
            </div>
          </Image.PreviewGroup>
        )}
      </section>
    </div>
  );
}

export default FeedBack;
