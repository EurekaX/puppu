const storage = require('../../utils/storage');
const { DEWORM_TYPES } = require('../../utils/constants');

Page({
  data: {
    activeTab: 'vaccine',
    records: []
  },

  onShow() {
    this.loadRecords();
  },

  loadRecords() {
    const dogId = getApp().globalData.currentDogId;
    const tab = this.data.activeTab;
    let records = [];

    if (tab === 'vaccine') {
      records = storage.getVaccineRecords(dogId).map((record) => {
        const status = storage.getStatus(record.nextDueDate);
        return {
          ...record,
          displayTitle: record.vaccineType,
          displayDate: '接种: ' + storage.formatDate(record.dateTaken),
          displaySub: record.hospital || '',
          statusColor: status.status === 'safe' ? 'safe' : status.status === 'warning' ? 'warning' : 'danger',
          statusLabel: status.label
        };
      });
    } else if (tab === 'deworm') {
      records = storage.getDewormRecords(dogId).map((record) => {
        const status = storage.getStatus(record.nextDueDate);
        const typeLabel = DEWORM_TYPES.find((item) => item.value === record.type);
        return {
          ...record,
          displayTitle: record.brandName + ' (' + (typeLabel ? typeLabel.label : '') + ')',
          displayDate: '用药: ' + storage.formatDate(record.dateTaken),
          displaySub: '周期: ' + record.periodMonths + '个月',
          statusColor: status.status === 'safe' ? 'safe' : status.status === 'warning' ? 'warning' : 'danger',
          statusLabel: status.label
        };
      });
    } else {
      records = storage.getFoodStockRecords(dogId).map((record) => {
        const remainingKg = Number(record.remainingKg || 0);
        return {
          ...record,
          displayTitle: record.brandName,
          displayDate: '购入: ' + storage.formatDate(record.purchaseDate),
          displaySub: '总量 ' + record.totalKg + 'kg · 剩余 ' + remainingKg + 'kg',
          statusColor: remainingKg <= 0 ? 'danger' : remainingKg <= 1 ? 'warning' : 'safe',
          statusLabel: remainingKg <= 0 ? '已缺粮' : remainingKg <= 1 ? '库存偏低' : '库存充足'
        };
      });
    }

    this.setData({ records });
  },

  onSwitchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab }, () => this.loadRecords());
  },

  onAddRecord() {
    const dogId = getApp().globalData.currentDogId;
    const tab = this.data.activeTab;

    if (!dogId) {
      wx.showToast({ title: '请先添加狗狗', icon: 'none' });
      return;
    }

    if (tab === 'vaccine') {
      wx.navigateTo({ url: '/pages/vaccine-form/vaccine-form?dogId=' + dogId });
    } else if (tab === 'deworm') {
      wx.navigateTo({ url: '/pages/deworm-form/deworm-form?dogId=' + dogId });
    } else {
      wx.navigateTo({ url: '/pages/food-stock-form/food-stock-form?dogId=' + dogId });
    }
  },

  onEditRecord(e) {
    const id = e.currentTarget.dataset.id;

    if (this.data.activeTab === 'vaccine') {
      wx.navigateTo({ url: '/pages/vaccine-form/vaccine-form?id=' + id });
    } else if (this.data.activeTab === 'deworm') {
      wx.navigateTo({ url: '/pages/deworm-form/deworm-form?id=' + id });
    } else {
      wx.navigateTo({ url: '/pages/food-stock-form/food-stock-form?id=' + id });
    }
  },

  onDeleteRecord(e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '删除后将无法恢复',
      success: (res) => {
        if (!res.confirm) return;

        if (this.data.activeTab === 'vaccine') {
          storage.deleteVaccineRecord(id);
        } else if (this.data.activeTab === 'deworm') {
          storage.deleteDewormRecord(id);
        } else {
          storage.deleteFoodStockRecord(id);
        }

        this.loadRecords();
        wx.showToast({ title: '已删除', icon: 'success' });
      }
    });
  }
});
