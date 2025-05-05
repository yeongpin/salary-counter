const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// 中间件
app.use(express.json());
app.use(cors());

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 所有路由都返回 index.html，以支持 SPA 前端路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 根据环境决定如何启动服务器
if (process.env.NODE_ENV === 'production') {
  // Phusion Passenger 会自动处理端口
  app.listen(() => {
    console.log('Production server is running');
  });
} else {
  // 本地开发使用命令行指定的端口
  const defaultPort = 3000;
  const serverPort = process.env.PORT || defaultPort;
  
  app.listen(serverPort, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${serverPort}`);
    console.log(`You can also access it via http://localhost:${serverPort}`);
  });
} 