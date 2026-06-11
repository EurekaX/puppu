Component({
  data: {
    selected: -1,
    list: []
  },

  lifetimes: {
    attached() {
      const list = [
        { pagePath: '/pages/index/index',     iconPath: '/images/tab-home.png',     selectedIconPath: '/images/tab-home-active.png' },
        { pagePath: '/pages/records/records', iconPath: '/images/tab-records.png',  selectedIconPath: '/images/tab-records-active.png' },
        { pagePath: '/pages/profile/profile', iconPath: '/images/tab-profile.png',  selectedIconPath: '/images/tab-profile-active.png' }
      ];

      const pages = getCurrentPages();
      const currentPage = pages.length > 0 ? pages[pages.length - 1].route : '';
      let selected = 0;
      for (let i = 0; i < list.length; i++) {
        if (list[i].pagePath.replace(/^\//, '') === currentPage) {
          selected = i;
          break;
        }
      }

      this.setData({ list, selected });
    }
  },

  pageLifetimes: {
    show() {
      const pages = getCurrentPages();
      const currentPage = pages.length > 0 ? pages[pages.length - 1].route : '';
      const list = this.data.list;
      for (let i = 0; i < list.length; i++) {
        if (list[i].pagePath.replace(/^\//, '') === currentPage) {
          if (this.data.selected !== i) {
            this.setData({ selected: i });
          }
          break;
        }
      }
    }
  },

  methods: {
    switchTab(e) {
      const { index, path } = e.currentTarget.dataset;
      if (index === this.data.selected) return;
      this.setData({ selected: index });
      wx.switchTab({ url: path });
    }
  }
});
