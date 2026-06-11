const storage = require('../../utils/storage');

Page({
  data: {
    vaccineNotify: true,
    dewormNotify: true,
    hasSubscribed: false,
    subscribeResult: ''
  },

  onLoad() {
    const vaccineNotify = wx.getStorageSync('setting_vaccine_notify');
    const dewormNotify = wx.getStorageSync('setting_deworm_notify');
    const hasSubscribed = wx.getStorageSync('subscribe_accepted') === true;
    this.setData({
      vaccineNotify: vaccineNotify !== false,
      dewormNotify: dewormNotify !== false,
      hasSubscribed
    });
  },

  onVaccineNotifyChange(e) {
    const value = e.detail.value;
    this.setData({ vaccineNotify: value });
    wx.setStorageSync('setting_vaccine_notify', value);
    if (value) this.requestSubscribe();
  },

  onDewormNotifyChange(e) {
    const value = e.detail.value;
    this.setData({ dewormNotify: value });
    wx.setStorageSync('setting_deworm_notify', value);
    if (value) this.requestSubscribe();
  },

  onSubscribe() {
    this.requestSubscribe();
  },

  requestSubscribe() {
    const tmplIds = [
      'Lw3_o2d4mJKNtEM3Yrfxp_l17_2iBoxt6v77-6BvudA',
      'Lw3_o2d4mJKNtEM3Yrfxp_l17_2iBoxt6v77-6BvudA',
      'Lw3_o2d4mJKNtEM3Yrfxp_l17_2iBoxt6v77-6BvudA'
    ].filter(Boolean);

    if (tmplIds.length === 0) {
      wx.showToast({ title: '请先配置模板ID', icon: 'none' });
      return;
    }

    if (wx.requestSubscribeMessage) {
      wx.requestSubscribeMessage({
        tmplIds,
        success: (res) => {
          let accepted = false;
          for (const id of tmplIds) {
            if (res[id] === 'accept') {
              accepted = true;
              break;
            }
          }
          this.setData({
            hasSubscribed: accepted,
            subscribeResult: accepted ? '已授权' : '用户拒绝'
          });
          wx.setStorageSync('subscribe_accepted', accepted);
          wx.showToast({ title: accepted ? '授权成功' : '已拒绝授权', icon: accepted ? 'success' : 'none' });
        },
        fail: () => {
          this.setData({ subscribeResult: '授权失败' });
          wx.showToast({ title: '授权失败', icon: 'none' });
        }
      });
    } else {
      wx.showToast({ title: '当前版本不支持', icon: 'none' });
    }
  },

  onExportData() {
    const exportData = {
      exportTime: storage.formatDate(new Date()),
      dogs: storage.getDogs(),
      vaccineRecords: wx.getStorageSync('vaccine_records') || [],
      dewormRecords: wx.getStorageSync('deworming_records') || [],
      foodStockRecords: wx.getStorageSync('food_stock_records') || []
    };

    wx.setClipboardData({
      data: JSON.stringify(exportData, null, 2),
      success: () => {
        wx.showToast({ title: '数据已复制', icon: 'success' });
      }
    });
  },

  onClearData() {
    wx.showModal({
      title: '危险操作',
      content: '将删除所有狗狗、疫苗、驱虫和存粮记录，此操作不可恢复。',
      confirmText: '确认清除',
      confirmColor: '#D96C5F',
      success: (res) => {
        if (!res.confirm) return;

        wx.setStorageSync('dogs', []);
        wx.setStorageSync('vaccine_records', []);
        wx.setStorageSync('deworming_records', []);
        wx.setStorageSync('food_stock_records', []);
        getApp().globalData.currentDogId = null;
        wx.showToast({ title: '已清除', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1000);
      }
    });
  }
});
