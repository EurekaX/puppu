const storage = require('../../utils/storage');
const { DEWORM_TYPES, DEWORM_BRANDS, DEWORM_CYCLES } = require('../../utils/constants');

Page({
  data: {
    isEdit: false,
    editId: null,
    dogId: null,
    dogs: [],
    dogNames: [],
    selectedDogName: '',
    dogIndex: -1,
    dewormTypes: DEWORM_TYPES,
    brands: DEWORM_BRANDS,
    brandIndex: -1,
    cycleLabels: DEWORM_CYCLES.map(c => c.label),
    cycleIndex: -1,
    selectedCycle: null,
    selectedCycleLabel: '',
    isCustomCycle: false,
    customDays: '',
    today: storage.formatDate(new Date()),
    form: {
      type: -1,
      brandName: '',
      dosage: '',
      dateTaken: '',
      periodMonths: 0,
      nextDueDate: ''
    },
    autoCalcHint: ''
  },

  onLoad(options) {
    const dogs = storage.getDogs();
    const dogNames = dogs.map(d => d.name);

    if (options.id) {
      const record = storage.getDewormRecord(options.id);
      if (record) {
        const cycle = DEWORM_CYCLES.find(c => c.value === record.periodMonths);
        const cycleIdx = cycle ? DEWORM_CYCLES.indexOf(cycle) : -1;
        this.setData({
          isEdit: true,
          editId: record._id,
          dogId: record.dogId,
          dogs,
          dogNames,
          cycleIndex: cycleIdx,
          selectedCycle: cycle || null,
          selectedCycleLabel: cycle ? cycle.label : '自定义',
          isCustomCycle: !cycle && record.periodMonths > 0,
          customDays: (!cycle && record.periodMonths > 0) ? String(record.periodMonths * 30) : '',
          form: {
            type: record.type,
            brandName: record.brandName || '',
            dosage: record.dosage || '',
            dateTaken: record.dateTaken ? storage.formatDate(record.dateTaken) : '',
            periodMonths: record.periodMonths || 0,
            nextDueDate: record.nextDueDate ? storage.formatDate(record.nextDueDate) : ''
          }
        });
        wx.setNavigationBarTitle({ title: '编辑驱虫记录' });
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
        dateTaken: storage.formatDate(new Date())
      }
    });
  },

  onDogChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({
      dogIndex: idx,
      dogId: this.data.dogs[idx]._id,
      selectedDogName: this.data.dogs[idx].name
    });
  },

  onTypeChange(e) {
    const value = parseInt(e.currentTarget.dataset.value);
    this.setData({ ['form.type']: value });
  },

  onBrandChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({
      brandIndex: idx,
      ['form.brandName']: DEWORM_BRANDS[idx]
    });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ ['form.' + field]: e.detail.value });
  },

  onDateChange(e) {
    const date = e.detail.value;
    const form = { ...this.data.form, dateTaken: date };
    this.setData({ form }, () => this.calcNextDate());
  },

  onCycleChange(e) {
    const idx = parseInt(e.detail.value);
    const cycle = DEWORM_CYCLES[idx];
    const isCustom = cycle.value === 0;

    this.setData({
      cycleIndex: idx,
      selectedCycle: cycle,
      selectedCycleLabel: cycle.label,
      isCustomCycle: isCustom,
      ['form.periodMonths']: cycle.value
    }, () => {
      if (!isCustom) this.calcNextDate();
    });
  },

  onCustomDaysInput(e) {
    const days = parseInt(e.detail.value) || 0;
    const months = Math.round(days / 30 * 10) / 10;
    this.setData({
      customDays: e.detail.value,
      ['form.periodMonths']: months
    }, () => this.calcNextDate());
  },

  onNextDateChange(e) {
    this.setData({
      ['form.nextDueDate']: e.detail.value,
      autoCalcHint: '已手动修改下次驱虫日期'
    });
  },

  calcNextDate() {
    const { form } = this.data;
    if (form.dateTaken && form.periodMonths > 0) {
      const nextDate = storage.formatDate(storage.addMonths(form.dateTaken, form.periodMonths));
      this.setData({
        ['form.nextDueDate']: nextDate,
        autoCalcHint: '已自动推算：' + form.dateTaken + ' + ' + form.periodMonths + '个月 = ' + nextDate
      });
    }
  },

  onSubmit() {
    const { form, isEdit, editId, dogId } = this.data;
    const targetDogId = dogId || (this.data.dogs[this.data.dogIndex] || {})._id;

    if (!targetDogId) {
      wx.showToast({ title: '请选择狗狗', icon: 'none' });
      return;
    }
    if (form.type === -1) {
      wx.showToast({ title: '请选择驱虫类型', icon: 'none' });
      return;
    }
    if (!form.brandName.trim()) {
      wx.showToast({ title: '请输入药品名称', icon: 'none' });
      return;
    }
    if (!form.dateTaken) {
      wx.showToast({ title: '请选择使用日期', icon: 'none' });
      return;
    }
    if (form.periodMonths <= 0) {
      wx.showToast({ title: '请选择驱虫周期', icon: 'none' });
      return;
    }
    if (!form.nextDueDate) {
      wx.showToast({ title: '请设置下次驱虫日期', icon: 'none' });
      return;
    }

    const data = {
      dogId: targetDogId,
      type: form.type,
      brandName: form.brandName.trim(),
      dosage: form.dosage.trim(),
      dateTaken: form.dateTaken,
      periodMonths: form.periodMonths,
      nextDueDate: form.nextDueDate
    };

    if (isEdit) data._id = editId;

    storage.saveDewormRecord(data);
    wx.showToast({ title: isEdit ? '已更新' : '已添加', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 1000);
  },

  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '删除后将无法恢复',
      success: (res) => {
        if (!res.confirm) return;
        storage.deleteDewormRecord(this.data.editId);
        wx.showToast({ title: '已删除', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1000);
      }
    });
  }
});
