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
    this.setData({
      vaccineNotify: vaccineNotify !== false,
      dewormNotify: dewormNotify !== false
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
    // 替换为你的模板ID——在微信公众平台 -> 订阅消息 中申请
    const tmplIds = [
      'Lw3_o2d4mJKNtEM3Yrfxp_l17_2iBoxt6v77-6BvudA',  // 疫苗到期提醒
      'Lw3_o2d4mJKNtEM3Yrfxp_l17_2iBoxt6v77-6BvudA',  // 驱虫到期提醒
      'Lw3_o2d4mJKNtEM3Yrfxp_l17_2iBoxt6v77-6BvudA', // 存粮不足提醒
    ].filter(Boolean);

    if (tmplIds.length === 0) {
      wx.showToast({ title: '请先配置模板ID', icon: 'none' });
      return;
    }

    if (wx.requestSubscribeMessage) {
      wx.requestSubscribeMessage({
        tmplIds: tmplIds,
        success: (res) => {
          // 检查是否至少有一个模板被授权
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
          if (accepted) {
            wx.showToast({ title: '授权成功', icon: 'success' });
            //   记录授权状态
            wx.setStorageSync('subscribe_accepted', true);
          } else {
            wx.showToast({ title: '已拒绝授权', icon: 'none' });
          }
        },
        fail: (err) => {
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
      confirmColor: '#F44336',
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
