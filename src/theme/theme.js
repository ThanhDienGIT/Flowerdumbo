// src/theme/theme.js
// Màu và cấu hình Ant Design dùng chung cho toàn site.

export const colors = {
  primary: "#0A7863", // xanh thương hiệu Xưởng Hoa's Kha
  primaryDark: "#075A4A",
  primarySoft: "#E6F2EF",
  accent: "#E8791E", // cam nhấn (viền, sọc trang trí)
  accentStrong: "#C25E12", // cam cho nút chữ trắng (đủ tương phản)
  text: "#2B2B2B",
  muted: "#666666",
  border: "#E6E6E6",
  pageBg: "#F5F5F5",
};

export const contact = {
  zaloUrl: "https://zalo.me/84843266691",
  zaloLabel: "084.326.6691",
  orderZaloUrl: "https://zalo.me/0344278772", // số đặt hoa ở trang chi tiết (giữ như cũ)
  tiktokUrl: "https://www.tiktok.com/@xng.hoa.online",
  tiktokLabel: "@xng.hoa.online",
  hours: "08:30 - 22:30",
  area: "TP. HCM - Cần Thơ",
};

export const antdTheme = {
  token: {
    colorPrimary: colors.primary,
    colorLink: colors.primary,
    borderRadius: 8,
    fontFamily:
      "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  },
};
