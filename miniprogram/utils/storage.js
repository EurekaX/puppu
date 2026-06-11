const sync = require("./sync");
function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
}

function getDogs() {
  return wx.getStorageSync('dogs') || [];
}

function getDog(id) {
  return getDogs().find(d => d._id === id) || null;
}

function saveDog(data) {
  const dogs = getDogs();
  if (data._id) {
    const idx = dogs.findIndex(d => d._id === data._id);
    if (idx > -1) dogs[idx] = { ...dogs[idx], ...data };
  } else {
    data._id = generateId();
    dogs.push(data);
  }
  wx.setStorageSync('dogs', dogs);
  sync.syncRecord('dogs', data).catch(() => {});
  return data;
}

function deleteDog(id) {
  wx.setStorageSync('dogs', getDogs().filter(d => d._id !== id));
  wx.setStorageSync('vaccine_records', getVaccineRecordsRaw().filter(r => r.dogId !== id));
  wx.setStorageSync('deworming_records', getDewormRecordsRaw().filter(r => r.dogId !== id));
  wx.setStorageSync('food_stock_records', getFoodStockRecordsRaw().filter(r => r.dogId !== id));
  sync.deleteRecord('dogs', id).catch(() => {});
  // 删除关联记录
  getVaccineRecordsRaw().filter(r => r.dogId === id).forEach(r => sync.deleteRecord('vaccine_records', r._id).catch(() => {}));
  getDewormRecordsRaw().filter(r => r.dogId === id).forEach(r => sync.deleteRecord('deworming_records', r._id).catch(() => {}));
  getFoodStockRecordsRaw().filter(r => r.dogId === id).forEach(r => sync.deleteRecord('food_stock_records', r._id).catch(() => {}));
}

function getVaccineRecordsRaw() {
  return wx.getStorageSync('vaccine_records') || [];
}

function getVaccineRecords(dogId) {
  const records = getVaccineRecordsRaw();
  const filtered = dogId ? records.filter(r => r.dogId === dogId) : records;
  return filtered.sort((a, b) => new Date(b.dateTaken) - new Date(a.dateTaken));
}

function getVaccineRecord(id) {
  return getVaccineRecordsRaw().find(r => r._id === id) || null;
}

function saveVaccineRecord(data) {
  const records = getVaccineRecordsRaw();
  if (data._id) {
    const idx = records.findIndex(r => r._id === data._id);
    if (idx > -1) records[idx] = { ...records[idx], ...data };
  } else {
    data._id = generateId();
    records.push(data);
  }
  wx.setStorageSync('vaccine_records', records);
  sync.syncRecord('vaccine_records', data).catch(() => {});
  return data;
}

function deleteVaccineRecord(id) {
  wx.setStorageSync('vaccine_records', getVaccineRecordsRaw().filter(r => r._id !== id));
  sync.deleteRecord('vaccine_records', id).catch(() => {});
}

function getDewormRecordsRaw() {
  return wx.getStorageSync('deworming_records') || [];
}

function getDewormRecords(dogId) {
  const records = getDewormRecordsRaw();
  const filtered = dogId ? records.filter(r => r.dogId === dogId) : records;
  return filtered.sort((a, b) => new Date(b.dateTaken) - new Date(a.dateTaken));
}

function getLatestDewormRecordsByType(dogId) {
  const latestByType = {};
  getDewormRecords(dogId).forEach(r => {
    const key = String(r.type);
    if (!latestByType[key]) latestByType[key] = r;
  });
  return Object.keys(latestByType).map(key => latestByType[key]);
}

function getDewormRecord(id) {
  return getDewormRecordsRaw().find(r => r._id === id) || null;
}

function saveDewormRecord(data) {
  const records = getDewormRecordsRaw();
  if (data._id) {
    const idx = records.findIndex(r => r._id === data._id);
    if (idx > -1) records[idx] = { ...records[idx], ...data };
  } else {
    data._id = generateId();
    records.push(data);
  }
  wx.setStorageSync('deworming_records', records);
  sync.syncRecord('deworming_records', data).catch(() => {});
  return data;
}

function deleteDewormRecord(id) {
  wx.setStorageSync('deworming_records', getDewormRecordsRaw().filter(r => r._id !== id));
  sync.deleteRecord('deworming_records', id).catch(() => {});
}

function getFoodStockRecordsRaw() {
  return wx.getStorageSync('food_stock_records') || [];
}

function getFoodStockRecords(dogId) {
  const records = getFoodStockRecordsRaw();
  const filtered = dogId ? records.filter(r => r.dogId === dogId) : records;
  return filtered.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
}

function getFoodStockRecord(id) {
  return getFoodStockRecordsRaw().find(r => r._id === id) || null;
}

function saveFoodStockRecord(data) {
  const records = getFoodStockRecordsRaw();
  if (data._id) {
    const idx = records.findIndex(r => r._id === data._id);
    if (idx > -1) records[idx] = { ...records[idx], ...data };
  } else {
    data._id = generateId();
    records.push(data);
  }
  wx.setStorageSync('food_stock_records', records);
  sync.syncRecord('food_stock_records', data).catch(() => {});
  return data;
}

function deleteFoodStockRecord(id) {
  wx.setStorageSync('food_stock_records', getFoodStockRecordsRaw().filter(r => r._id !== id));
  sync.deleteRecord('food_stock_records', id).catch(() => {});
}

function getFoodStockSummary(dogId) {
  const records = getFoodStockRecords(dogId);
  if (!records.length) {
    return { status: 'none', label: '暂无存粮记录', remainingKg: 0, latestRecord: null };
  }

  const latestRecord = records[0];
  const remainingKg = Number(latestRecord.remainingKg || 0);
  let status = 'safe';
  let label = '库存充足';

  if (remainingKg <= 0) {
    status = 'overdue';
    label = '已缺粮';
  } else if (remainingKg <= 1) {
    status = 'warning';
    label = '库存偏低';
  }

  return {
    status,
    label: label + ' ' + remainingKg + 'kg',
    remainingKg,
    latestRecord
  };
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function diffInDays(date1, date2) {
  const d1 = new Date(date1);
  d1.setHours(0, 0, 0, 0);
  const d2 = new Date(date2);
  d2.setHours(0, 0, 0, 0);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

function formatDate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function calcAge(birthday) {
  const now = new Date();
  const birth = new Date(birthday);
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (now.getDate() < birth.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }

  if (years > 0) return years + '岁' + (months > 0 ? months + '个月' : '');
  if (months > 0) return months + '个月';
  return diffInDays(birthday, now) + '天';
}

function getStatus(nextDueDate) {
  if (!nextDueDate) return { status: 'none', label: '无记录', color: 'text-secondary' };

  const days = diffInDays(new Date(), nextDueDate);
  if (days < 0) {
    return { status: 'overdue', label: '已超期' + Math.abs(days) + '天', color: 'danger' };
  }
  if (days <= 7) {
    return { status: 'warning', label: days === 0 ? '今天到期' : '即将到期(' + days + '天)', color: 'warning' };
  }
  return { status: 'safe', label: '安全(' + days + '天)', color: 'primary' };
}


/**
 * 获取指定狗狗未来 days 天内所有临期提醒
 * @param {string} dogId
 * @param {number} days  - 提前天数，默认 7
 * @returns {Array<{_id, type, title, date, tagColor, tagLabel, recordId}>}
 */
function getUpcomingReminders(dogId, days = 7) {
  if (!dogId) return [];
  const reminders = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 疫苗提醒
  const vaccineRecords = getVaccineRecords(dogId);
  vaccineRecords.forEach(r => {
    if (!r.nextDueDate) return;
    const due = new Date(r.nextDueDate);
    due.setHours(0, 0, 0, 0);
    const d = diffInDays(today, due);
    if (d <= days) {
      const status = getStatus(r.nextDueDate);
      reminders.push({
        _id: 'v_' + r._id,
        type: 'vaccine',
        title: r.vaccineType,
        date: formatDate(r.nextDueDate),
        dueDays: d,
        tagColor: status.status === 'overdue' ? 'danger' : 'warning',
        tagLabel: status.label,
        recordId: r._id
      });
    }
  });

  // 驱虫提醒
  const dewormRecords = getLatestDewormRecordsByType(dogId);
  dewormRecords.forEach(r => {
    if (!r.nextDueDate) return;
    const due = new Date(r.nextDueDate);
    due.setHours(0, 0, 0, 0);
    const d = diffInDays(today, due);
    if (d <= days) {
      const status = getStatus(r.nextDueDate);
      reminders.push({
        _id: 'd_' + r._id,
        type: 'deworm',
        title: (r.brandName || '驱虫') + ' - ' + formatDate(r.dateTaken),
        date: formatDate(r.nextDueDate),
        dueDays: d,
        tagColor: status.status === 'overdue' ? 'danger' : 'warning',
        tagLabel: status.label,
        recordId: r._id
      });
    }
  });

  // 存粮提醒：按日消耗估算剩余天数
  const foodRecords = getFoodStockRecords(dogId);
  foodRecords.forEach(r => {
    const remainingKg = Number(r.remainingKg || 0);
    const dailyConsumeKg = Number(r.dailyConsumeKg || 0);

    if (remainingKg > 0 && dailyConsumeKg > 0) {
      const estDays = Math.floor(remainingKg / dailyConsumeKg);
      if (estDays <= days) {
        const isOverdue = estDays <= 0;
        reminders.push({
          _id: 'f_' + r._id,
          type: 'food',
          title: r.brandName + ' (存粮)',
          date: '剩余 ' + remainingKg + 'kg',
          dueDays: isOverdue ? -1 : estDays,
          tagColor: isOverdue ? 'danger' : 'warning',
          tagLabel: isOverdue ? '已缺粮' : estDays + '天后缺粮',
          recordId: r._id
        });
      }
    } else if (remainingKg <= 0) {
      reminders.push({
        _id: 'f_' + r._id,
        type: 'food',
        title: r.brandName + ' (存粮)',
        date: '剩余 0kg',
        dueDays: -1,
        tagColor: 'danger',
        tagLabel: '已缺粮',
        recordId: r._id
      });
    }
  });

  // 按到期紧迫程度排序
  reminders.sort((a, b) => a.dueDays - b.dueDays);

  return reminders;
}


module.exports = {
  generateId,
  getDogs,
  getDog,
  saveDog,
  deleteDog,
  getVaccineRecords,
  getVaccineRecord,
  saveVaccineRecord,
  deleteVaccineRecord,
  getDewormRecords,
  getDewormRecord,
  saveDewormRecord,
  deleteDewormRecord,
  getFoodStockRecords,
  getFoodStockRecord,
  saveFoodStockRecord,
  deleteFoodStockRecord,
  getFoodStockSummary,
  getUpcomingReminders,
  addDays,
  addMonths,
  diffInDays,
  formatDate,
  calcAge,
  getStatus
};
