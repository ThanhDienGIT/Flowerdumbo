// src/DTO/FlowerDTO.js

const FlowerDTO = ({
  id,
  name,
  description,
  price,
  quantity,
  status,
  importDate,
  image,
  idCategory, // <--- THÊM TRƯỜNG idCategory VÀO ĐÂY
} = {}) => {
  return {
    id: id !== undefined ? id : null, // Mặc định ID là null nếu là mới
    name: name || "",
    description: description || "",
    price: price !== undefined ? price : 0,
    quantity: quantity !== undefined ? quantity : 0,
    status: status !== undefined ? status : 1, // Mặc định là có hàng (1)
    importDate: importDate || new Date().toISOString().split('T')[0],
    image: image || "",
    idCategory: idCategory || null, // <--- ĐẶT GIÁ TRỊ MẶC ĐỊNH CHO idCategory
  };
};

export default FlowerDTO;