const storage = require('../../utils/storage');
const { VACCINE_TYPES } = require('../../utils/constants');

Page({
  data: {
    isEdit: false,
    editId: null,
    dogId: null,
    dogs: [],
    dogNames: [],
    selectedDogName: '',
    dogIndex: -1,
    typeLabels: VACCINE_TYPES.map(t => t.label),
    typeIndex: -1,
    selectedType: null,
    today: storage.formatDate(new Date()),
    form: {
      vaccineType: '',
      dateTaken: '',
      nextDueDate: '',
      hospital: '',
      remark: ''
    },
    autoCalcHint: ''
  },

  onLoad(options) {
    const dogs = storage.getDogs();
    const dogNames = dogs.map(d => d.name);

    if (options.id) {
      const record = storage.getVaccineRecord(options.id);
      if (record) {
        const typeIdx = VACCINE_TYPES.findIndex(t => t.label === record.vaccineType);
        this.setData({
          isEdit: true,
          editId: record._id,
          dogId: record.dogId,
          dogs,
          dogNames,
          typeIndex: typeIdx,
          selectedType: typeIdx > -1 ? VACCINE_TYPES[typeIdx] : null,
          form: {
            vaccineType: record.vaccineType || '',
            dateTaken: record.dateTaken ? storage.formatDate(record.dateTaken) : '',
            nextDueDate: record.nextDueDate ? storage.formatDate(record.nextDueDate) : '',
            hospital: record.hospital || '',
            remark: record.remark || ''
          }
        });
        wx.setNavigationBarTitle({ title: '编辑疫苗记录' });
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
    const dog = this.data.dogs[idx];
    this.setData({
      dogIndex: idx,
      dogId: dog._id,
      selectedDogName: dog.name
    });
  },

  onTypeChange(e) {
    const idx = parseInt(e.detail.value);
    const type = VACCINE_TYPES[idx];
    const form = { ...this.data.form, vaccineType: type.label };

    if (form.dateTaken && type) {
      form.nextDueDate = storage.formatDate(storage.addDays(form.dateTaken, type.intervalDays));
      this.setData({ autoCalcHint: '已按 ' + type.intervalDays + ' 天间隔自动推算' });
    }

    this.setData({ typeIndex: idx, selectedType: type, form });
  },

  onDateChange(e) {
    const date = e.detail.value;
    const form = { ...this.data.form, dateTaken: date };

    if (this.data.selectedType && date) {
      form.nextDueDate = storage.formatDate(storage.addDays(date, this.data.selectedType.intervalDays));
      this.setData({ autoCalcHint: '已按 ' + this.data.selectedType.intervalDays + ' 天间隔自动推算' });
    }

    this.setData({ form });
  },

  onNextDateChange(e) {
    this.setData({
      ['form.nextDueDate']: e.detail.value,
      autoCalcHint: '已手动修改下次接种日期'
    });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ ['form.' + field]: e.detail.value });
  },

  onSubmit() {
    const { form, isEdit, editId, dogId } = this.data;
    const targetDogId = dogId || (this.data.dogs[this.data.dogIndex] || {})._id;

    if (!targetDogId) {
      wx.showToast({ title: '请选择狗狗', icon: 'none' });
      return;
    }
    if (!form.vaccineType) {
      wx.showToast({ title: '请选择接种类型', icon: 'none' });
      return;
    }
    if (!form.dateTaken) {
      wx.showToast({ title: '请选择接种日期', icon: 'none' });
      return;
    }
    if (!form.nextDueDate) {
      wx.showToast({ title: '请设置下次接种日期', icon: 'none' });
      return;
    }

    const data = {
      dogId: targetDogId,
      vaccineType: form.vaccineType,
      dateTaken: form.dateTaken,
      nextDueDate: form.nextDueDate,
      hospital: form.hospital.trim(),
      remark: form.remark.trim()
    };

    if (isEdit) data._id = editId;

    storage.saveVaccineRecord(data);
    wx.showToast({ title: isEdit ? '已更新' : '已添加', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 1000);
  },

  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '删除后将无法恢复',
      success: (res) => {
        if (!res.confirm) return;
        storage.deleteVaccineRecord(this.data.editId);
        wx.showToast({ title: '已删除', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1000);
      }
    });
  }
});
