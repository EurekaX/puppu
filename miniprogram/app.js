const cloud = require('./utils/cloud');
const sync = require('./utils/sync');

App({
  globalData: {
    currentDogId: null,
    cloudReady: false
  },

  onLaunch() {
    // Init cloud
    cloud.init().then(() => {
      this.globalData.cloudReady = true;
      // 启动后从云拉取数据合并到本地
      sync.pullAll().then(() => {
        console.log('[app] initial cloud sync complete');
      });
    });

    // Init local storage
    if (!wx.getStorageSync('dogs')) wx.setStorageSync('dogs', []);
    if (!wx.getStorageSync('vaccine_records')) wx.setStorageSync('vaccine_records', []);
    if (!wx.getStorageSync('deworming_records')) wx.setStorageSync('deworming_records', []);
    if (!wx.getStorageSync('food_stock_records')) wx.setStorageSync('food_stock_records', []);

    // Set current dog
    const dogList = wx.getStorageSync('dogs') || [];
    if (dogList.length > 0 && !this.globalData.currentDogId) {
      this.globalData.currentDogId = dogList[0]._id;
    }
  }
});
