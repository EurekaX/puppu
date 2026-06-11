const storage = require('../../utils/storage');

Page({
  data: {
    dogs: [],
    dogNames: [],
    currentDogIndex: 0,
    currentDog: null,
    vaccineStatus: 'none',
    vaccineStatusLabel: '暂无记录',
    dewormStatus: 'none',
    dewormStatusLabel: '暂无记录',
    foodStockStatus: 'none',
    foodStockStatusLabel: '暂无存粮记录',
    reminders: []
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const dogs = storage.getDogs();
    const dogNames = dogs.map(d => d.name);
    const app = getApp();
    const currentDogId = app.globalData.currentDogId;

    let currentDogIndex = 0;
    if (currentDogId) {
      const idx = dogs.findIndex(d => d._id === currentDogId);
      if (idx > -1) currentDogIndex = idx;
    } else if (dogs.length > 0) {
      app.globalData.currentDogId = dogs[0]._id;
    }

    const currentDog = dogs[currentDogIndex] || null;
    if (currentDog) currentDog.age = storage.calcAge(currentDog.birthday);

    const vaccineRecords = storage.getVaccineRecords(currentDog ? currentDog._id : null);
    const latestVaccine = vaccineRecords.length > 0 ? vaccineRecords[0] : null;
    const vaccineStatus = latestVaccine
      ? storage.getStatus(latestVaccine.nextDueDate)
      : { status: 'none', label: '暂无记录', color: 'text-secondary' };

    const dewormRecords = storage.getDewormRecords(currentDog ? currentDog._id : null);
    const latestDeworm = dewormRecords.length > 0 ? dewormRecords[0] : null;
    const dewormStatus = latestDeworm
      ? storage.getStatus(latestDeworm.nextDueDate)
      : { status: 'none', label: '暂无记录', color: 'text-secondary' };

    const foodStockSummary = storage.getFoodStockSummary(currentDog ? currentDog._id : null);

    const reminders = storage.getUpcomingReminders(currentDog ? currentDog._id : null, 7);

    this.setData({
      dogs,
      dogNames,
      currentDogIndex,
      currentDog,
      vaccineStatus: vaccineStatus.status,
      vaccineStatusLabel: vaccineStatus.label,
      dewormStatus: dewormStatus.status,
      dewormStatusLabel: dewormStatus.label,
      foodStockStatus: foodStockSummary.status,
      foodStockStatusLabel: foodStockSummary.label,
      reminders
    });
  },

  onSwitchDog(e) {
    const idx = parseInt(e.detail.value);
    const dog = this.data.dogs[idx];
    getApp().globalData.currentDogId = dog._id;
    this.loadData();
  },

  onAddDog() {
    wx.navigateTo({ url: '/pages/dog-form/dog-form' });
  },

  onAddVaccine() {
    if (!this.data.currentDog) {
      wx.showToast({ title: '请先添加狗狗', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/vaccine-form/vaccine-form?dogId=' + this.data.currentDog._id });
  },

  onAddDeworm() {
    if (!this.data.currentDog) {
      wx.showToast({ title: '请先添加狗狗', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/deworm-form/deworm-form?dogId=' + this.data.currentDog._id });
  },

  onAddFoodStock() {
    if (!this.data.currentDog) {
      wx.showToast({ title: '请先添加狗狗', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/food-stock-form/food-stock-form?dogId=' + this.data.currentDog._id });
  },

  onTapReminder(e) {
    const item = e.currentTarget.dataset.item;
    if (item.type === 'vaccine') {
      wx.navigateTo({ url: '/pages/vaccine-form/vaccine-form?dogId=' + this.data.currentDog._id + '&type=vaccine' });
    } else if (item.type === 'deworm') {
      wx.navigateTo({ url: '/pages/deworm-form/deworm-form?dogId=' + this.data.currentDog._id + '&type=deworm' });
    } else {
      wx.navigateTo({ url: '/pages/food-stock-form/food-stock-form?id=' + item.recordId });
    }
  }
});
