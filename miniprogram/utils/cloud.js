/**
 * 云开发工具模块
 * 封装云数据库初始化、数据同步等基础能力
 */

let _inited = false;

/**
 * 初始化云开发环境
 * @returns {Promise}
 */
function init() {
  if (_inited) return Promise.resolve();
  return new Promise((resolve, reject) => {
    wx.cloud.init({
      env: "cloud1-d5gyuz11s34e913ec", // 替换为你的云环境ID
      traceUser: true,
      success: () => {
        _inited = true;
        console.log("[cloud] init success");
        resolve();
      },
      fail: (err) => {
        console.error("[cloud] init fail", err);
        // 云初始化失败不阻塞，降级为本地模式
        resolve();
      },
    });
  });
}

/**
 * 获取云数据库实例
 */
function db() {
  return wx.cloud.database();
}

/**
 * 获取当前用户 openId
 * @returns {Promise<string|null>}
 */
function getOpenId() {
  return new Promise((resolve) => {
    wx.cloud.callFunction({
      name: "getOpenId",
      success: (res) => {
        resolve(res.result && res.result.openid ? res.result.openid : null);
      },
      fail: () => resolve(null),
    });
  });
}

module.exports = {
  init,
  db,
  getOpenId,
};
