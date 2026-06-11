/**
 * 云数据同步层
 * 在本地 storage 操作完成后，异步同步到云数据库
 * 启动时从云数据库拉取数据合并到本地
 */

const cloud = require("./cloud");

// 集合名称映射
const COLLECTIONS = {
  dogs: "dogs",
  vaccine_records: "vaccine_records",
  deworming_records: "deworming_records",
  food_stock_records: "food_stock_records",
};

/**
 * 获取 openId（带缓存）
 */
let _openIdCache = null;
async function _getOpenId() {
  if (_openIdCache) return _openIdCache;
  _openIdCache = await cloud.getOpenId();
  return _openIdCache;
}

/**
 * 同步单条记录到云端（新增或更新）
 * @param {string} collection - 集合名
 * @param {object} record - 记录对象（含 _id）
 */
async function syncRecord(collection, record) {
  const db = cloud.db();
  const col = db.collection(COLLECTIONS[collection] || collection);
  try {
    const existing = await col.doc(record._id).get();
    if (existing.data) {
      await col.doc(record._id).update({
        data: { ...record, _syncAt: db.serverDate() },
      });
    } else {
      await col.add({
        data: { ...record, _syncAt: db.serverDate() },
      });
    }
  } catch (e) {
    // doc 不存在，直接 add
    try {
      await col.add({
        data: { ...record, _syncAt: db.serverDate() },
      });
    } catch (addErr) {
      console.error("[sync] add failed", collection, record._id, addErr);
    }
  }
}

/**
 * 从云端删除单条记录
 */
async function deleteRecord(collection, id) {
  try {
    const db = cloud.db();
    await db
      .collection(COLLECTIONS[collection] || collection)
      .doc(id)
      .remove();
  } catch (e) {
    console.error("[sync] delete failed", collection, id, e);
  }
}

/**
 * 从云端拉取某个集合的全部数据，合并到本地
 * @param {string} collection - 集合名
 * @param {string} localKey - 本地 storage key
 */
async function pullCollection(collection, localKey) {
  try {
    const db = cloud.db();
    const col = db.collection(COLLECTIONS[collection] || collection);
    const { data } = await col.get();
    if (data && data.length > 0) {
      // 合并：云端数据覆盖同名 _id 的本地数据
      const local = wx.getStorageSync(localKey) || [];
      const localMap = {};
      local.forEach((item) => (localMap[item._id] = item));

      for (const item of data) {
        localMap[item._id] = item;
      }

      const merged = Object.values(localMap);
      wx.setStorageSync(localKey, merged);
      console.log(`[sync] pulled ${collection}: ${data.length} items from cloud`);
    }
  } catch (e) {
    console.warn("[sync] pull failed", collection, e);
  }
}

/**
 * 启动时全量同步：从云端拉取所有数据
 */
async function pullAll() {
  if (!wx.cloud) return;
  await Promise.allSettled([
    pullCollection("dogs", "dogs"),
    pullCollection("vaccine_records", "vaccine_records"),
    pullCollection("deworming_records", "deworming_records"),
    pullCollection("food_stock_records", "food_stock_records"),
  ]);
}

/**
 * 将本地所有数据全量推送到云端
 */
async function pushAll() {
  if (!wx.cloud) return;
  const collections = [
    { key: "dogs", collection: "dogs" },
    { key: "vaccine_records", collection: "vaccine_records" },
    { key: "deworming_records", collection: "deworming_records" },
    { key: "food_stock_records", collection: "food_stock_records" },
  ];

  for (const { key, collection } of collections) {
    const local = wx.getStorageSync(key) || [];
    for (const item of local) {
      await syncRecord(collection, item);
    }
  }
}

/**
 * 保存记录并同步到云端
 */
async function saveAndSync(collection, data, localKey) {
  // 先确保本地已保存
  wx.setStorageSync(localKey, data);
  // 异步推送到云端
  syncRecord(collection, data).catch(() => {});
}

/**
 * 删除记录并同步删除到云端
 */
async function deleteAndSync(collection, id) {
  deleteRecord(collection, id).catch(() => {});
}

module.exports = {
  syncRecord,
  deleteRecord,
  pullAll,
  pushAll,
  saveAndSync,
  deleteAndSync,
};
