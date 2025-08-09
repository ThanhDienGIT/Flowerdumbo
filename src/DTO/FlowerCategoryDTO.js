/**
 * Data Transfer Object (DTO) cho một sản phẩm trong danh mục (Flower Classification).
 * * Object này định nghĩa cấu trúc và các giá trị mặc định cho một sản phẩm
 * khi nó được lấy từ bảng phân loại 'FlowerClassification'.
 * Rất hữu ích để khởi tạo state hoặc tạo một đối tượng sản phẩm mới.
 */
const FlowerCategoryDTO = {
  // --- Thông tin định danh ---
  categoryId: null, // ID của danh mục mà sản phẩm này thuộc về. `null` cho biết chưa xác định.
  flowerId: null,   // ID gốc của sản phẩm hoa.
  id: null,         // ID của sản phẩm (thường trùng với flowerId).

  // --- Chi tiết sản phẩm ---
  name: '',         // Tên sản phẩm, ví dụ: "Hoa sinh nhật..."
  description: '',  // Mô tả chi tiết về sản phẩm.
  price: 0,         // Giá sản phẩm, mặc định là 0.
  image: '',        // Đường dẫn (URL) đến hình ảnh sản phẩm.

  // --- Thông tin kho và trạng thái ---
  quantity: 0,      // Số lượng tồn kho, mặc định là 0.
  status: 1,        // Trạng thái sản phẩm (ví dụ: 1 = Đang bán, 0 = Ẩn). Mặc định là 1.

  // --- Dữ liệu khác ---
  importDate: '',   // Ngày nhập hàng, ví dụ: "2025-07-19"
};

export default FlowerCategoryDTO;