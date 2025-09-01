import React, { useRef, useMemo } from 'react';
import JoditEditor from 'jodit-react';

const JoditWrapper = ({ value, onChange, placeholder }) => {
  const editor = useRef(null);

  // Cấu hình Jodit Editor
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: placeholder || 'Start typings...',
      height: 350, // Bạn có thể tùy chỉnh chiều cao tại đây
    }),
    [placeholder]
  );

  return (
    <JoditEditor
      ref={editor}
      value={value}
      config={config}
      tabIndex={1}
      // onChange là hàm mà Ant Design Form.Item sẽ cung cấp
      onChange={onChange}
    />
  );
};

export default JoditWrapper;