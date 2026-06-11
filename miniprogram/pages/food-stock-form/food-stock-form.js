const storage = require('../../utils/storage');

Page({
  data: {
    isEdit: false,
    editId: null,
    dogId: null,
    dogs: [],
    dogNames: [],
    selectedDogName: '',
    dogIndex: -1,
    today: storage.formatDate(new Date()),
    form: {
      brandName: '',
      purchaseDate: '',
      totalKg: '',
      remainingKg: '',
      dailyConsumeKg: '',
      remark: ''
    },
    stockHint: ''
  },

  onLoad(options) {
    const dogs = storage.getDogs();
    const dogNames = dogs.map(d => d.name);

    if (options.id) {
      const record = storage.getFoodStockRecord(options.id);
      if (record) {
        this.setData({
          isEdit: true,
          editId: record._id,
          dogId: record.dogId,
          dogs,
          dogNames,
          form: {
            brandName: record.brandName || '',
            purchaseDate: record.purchaseDate ? storage.formatDate(record.purchaseDate) : '',
            totalKg: String(record.totalKg || ''),
            remainingKg: String(record.remainingKg || ''),
            dailyConsumeKg: String(record.dailyConsumeKg || ''),
            remark: record.remark || ''
          }
        });
        wx.setNavigationBarTitle({ title: '编辑存粮记录' });
        this.updateStockHint();
        return;
      }
    }

    const dogId = options.dogId || getApp().globalData.currentDogId;
    let selectedDogName = '';
    let dogIndex = -1;

    if (dogId) {
      dogIndex = dogs.findIndex(d => d._id === dogId);
      if (dogIndex > -1) selectedDogName = dogs[dogIndex].name;
    }

    this.setData({
      dogs,
      dogNames,
      dogId: dogId || null,
      dogIndex,
      selectedDogName,
      form: {
        ...this.data.form,
        purchaseDate: storage.formatDate(new Date())
      }
    });
  },

  onDogChange(e) {
    const idx = parseInt(e.detail.value);
    const dog = this.data.dogs[idx];
    this.setData({
      dogIndex: idx,
      dogId: dog._id,
      selectedDogName: dog.name
    });
  },

  onDateChange(e) {
    this.setData({ ['form.purchaseDate']: e.detail.value });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ ['form.' + field]: e.detail.value }, () => this.updateStockHint());
  },

  updateStockHint() {
    const remainingKg = Number(this.data.form.remainingKg || 0);
    const dailyConsumeKg = Number(this.data.form.dailyConsumeKg || 0);

    if (remainingKg > 0 && dailyConsumeKg > 0) {
      const days = Math.floor(remainingKg / dailyConsumeKg);
      this.setData({ stockHint: '按当前日消耗，预计还能吃 ' + days + ' 天' });
      return;
    }

    this.setData({ stockHint: '' });
  },

  onSubmit() {
    const { form, isEdit, editId, dogId } = this.data;
    const targetDogId = dogId || (this.data.dogs[this.data.dogIndex] || {})._id;
    const totalKg = Number(form.totalKg);
    const remainingKg = Number(form.remainingKg);
    const dailyConsumeKg = Number(form.dailyConsumeKg || 0);

    if (!targetDogId) {
      wx.showToast({ title: '请选择狗狗', icon: 'none' });
      return;
    }
    if (!form.brandName.trim()) {
      wx.showToast({ title: '请输入粮食名称', icon: 'none' });
      return;
    }
    if (!form.purchaseDate) {
      wx.showToast({ title: '请选择购入日期', icon: 'none' });
      return;
    }
    if (!(totalKg > 0)) {
      wx.showToast({ title: '请输入总重量', icon: 'none' });
      return;
    }
    if (remainingKg < 0 || remainingKg > totalKg) {
      wx.showToast({ title: '剩余重量不合理', icon: 'none' });
      return;
    }

    const data = {
      dogId: targetDogId,
      brandName: form.brandName.trim(),
      purchaseDate: form.purchaseDate,
      totalKg,
      remainingKg,
      dailyConsumeKg,
      remark: form.remark.trim()
    };

    if (isEdit) data._id = editId;

    storage.saveFoodStockRecord(data);
    wx.showToast({ title: isEdit ? '已更新' : '已添加', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 1000);
  },

  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '删除后将无法恢复',
      success: (res) => {
        if (!res.confirm) return;
        storage.deleteFoodStockRecord(this.data.editId);
        wx.showToast({ title: '已删除', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1000);
      }
    });
  }
});
