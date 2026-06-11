const storage = require('../../utils/storage');

Page({
  data: {
    dogs: [],
    currentDogId: null
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const dogs = storage.getDogs().map(d => ({
      ...d,
      age: storage.calcAge(d.birthday)
    }));
    const app = getApp();
    this.setData({
      dogs,
      currentDogId: app.globalData.currentDogId
    });
  },

  onSelectDog(e) {
    const id = e.currentTarget.dataset.id;
    getApp().globalData.currentDogId = id;
    this.setData({ currentDogId: id });
    wx.showToast({ title: '已切换', icon: 'success', duration: 1000 });
    wx.switchTab({ url: '/pages/index/index' });
  },

  onAddDog() {
    wx.navigateTo({ url: '/pages/dog-form/dog-form' });
  },

  onEditDog(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/dog-form/dog-form?id=' + id });
  },

  onDeleteDog(e) {
    const id = e.currentTarget.dataset.id;
    const dog = storage.getDog(id);
    wx.showModal({
      title: '确认删除',
      content: '将删除“' + dog.name + '”及其所有疫苗、驱虫和存粮记录，删除后无法恢复。',
      success: (res) => {
        if (!res.confirm) return;

        storage.deleteDog(id);
        const app = getApp();
        if (app.globalData.currentDogId === id) {
          const remaining = storage.getDogs();
          app.globalData.currentDogId = remaining.length > 0 ? remaining[0]._id : null;
        }
        this.loadData();
        wx.showToast({ title: '已删除', icon: 'success' });
      }
    });
  },

  onGoSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' });
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
  }
});
