export const projects = [
  {
    id: 'project-a', // Dùng string làm id sẽ tiện hơn khi làm route
    title: 'Dự án A - Website Thương mại điện tử',
    description: 'Một trang web bán hàng được xây dựng bằng React, Redux và Ant Design.',
    technologies: ['React', 'Redux', 'Ant Design', 'Firebase'],
    live_url: 'https://your-project-a.com',
    github_url: 'https://github.com/your-username/project-a',
    image: '/assets/images/project-a.jpg' // Đường dẫn tới ảnh trong assets
  },
  {
    id: 'project-b',
    title: 'Dự án B - Ứng dụng Quản lý công việc',
    description: 'Ứng dụng giúp quản lý công việc cá nhân và nhóm.',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB'],
    live_url: 'https://your-project-b.com',
    github_url: 'https://github.com/your-username/project-b',
    image: '/assets/images/project-b.jpg'
  },
];