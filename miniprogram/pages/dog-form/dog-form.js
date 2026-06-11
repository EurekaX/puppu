const storage = require('../../utils/storage');
const { BREEDS, GENDER_OPTIONS } = require('../../utils/constants');

Page({
  data: {
    isEdit: false,
    editId: null,
    breeds: BREEDS,
    breedIndex: -1,
    genderOptions: GENDER_OPTIONS,
    today: storage.formatDate(new Date()),
    form: {
      name: '',
      breed: '',
      gender: -1,
      birthday: '',
      weight: '',
      avatar: ''
    },
    ageDisplay: ''
  },

  onLoad(options) {
    if (options.id) {
      const dog = storage.getDog(options.id);
      if (dog) {
        const breedIndex = BREEDS.indexOf(dog.breed);
        this.setData({
          isEdit: true,
          editId: dog._id,
          breedIndex: breedIndex > -1 ? breedIndex : -1,
          form: {
            name: dog.name || '',
            breed: dog.breed || '',
            gender: dog.gender !== undefined ? dog.gender : -1,
            birthday: dog.birthday ? storage.formatDate(dog.birthday) : '',
            weight: dog.weight !== undefined ? String(dog.weight) : '',
            avatar: dog.avatar || ''
          },
          ageDisplay: dog.birthday ? storage.calcAge(dog.birthday) : ''
        });
        wx.setNavigationBarTitle({ title: '编辑狗狗' });
      }
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ ['form.' + field]: value });
  },

  onBreedChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({
      breedIndex: idx,
      ['form.breed']: BREEDS[idx]
    });
  },

  onGenderChange(e) {
    const value = parseInt(e.currentTarget.dataset.value);
    this.setData({ ['form.gender']: value });
  },

  onBirthdayChange(e) {
    const date = e.detail.value;
    const age = storage.calcAge(date);
    this.setData({
      ['form.birthday']: date,
      ageDisplay: age
    });
  },

  onChooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ ['form.avatar']: res.tempFilePaths[0] });
      }
    });
  },

  onSubmit() {
    const { form, isEdit, editId } = this.data;

    if (!form.name.trim()) {
      wx.showToast({ title: '请输入狗狗名字', icon: 'none' });
      return;
    }
    if (!form.breed) {
      wx.showToast({ title: '请选择品种', icon: 'none' });
      return;
    }
    if (form.gender === -1) {
      wx.showToast({ title: '请选择性别', icon: 'none' });
      return;
    }
    if (!form.birthday) {
      wx.showToast({ title: '请选择出生日期', icon: 'none' });
      return;
    }

    const data = {
      name: form.name.trim(),
      breed: form.breed,
      gender: form.gender,
      birthday: form.birthday,
      weight: form.weight ? parseFloat(form.weight) : null,
      avatar: form.avatar
    };

    if (isEdit) data._id = editId;

    const saved = storage.saveDog(data);
    if (!isEdit) getApp().globalData.currentDogId = saved._id;

    wx.showToast({ title: isEdit ? '已更新' : '已添加', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 1000);
  }
});
