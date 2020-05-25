const local = require('./../build/setting');

const host = local();

/**
 * 项目启动配置
 * publicPath 项目根路径
 * host 本机host
 * port 本机端口
 * proxy webpack代理
 */
const config = {
  publicPath: '/test-paper/',
  host: host || 'http://localhost',
  prot: 8080,
  proxyTarget: 'https://test.com'
}

module.exports = {
  publicPath: config.publicPath,
  host: config.host,
  port: config.prot
}