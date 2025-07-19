// src/DTO/CategoryDTO.js

const CategoryDTO = ({
  id,
  name,
  url,
  image,
} = {}) => {
  return {
    id: id !== undefined ? id : 0,
    name: name || "",
    url: url || "",
    image: image || "",
  };
};

export default CategoryDTO;