import React from 'react';
import DOMPurify from 'dompurify';

const JoditView = ({ htmlContent }) => {
  // Đảm bảo htmlContent là một chuỗi, nếu không thì mặc định là chuỗi rỗng
  const safeContent = String(htmlContent || '');
  
  // Lọc HTML bằng DOMPurify
  const sanitizedHtml = DOMPurify.sanitize(safeContent);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default JoditView;