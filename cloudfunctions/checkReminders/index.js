const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// ========== 模板 ID（替换为你的模板 ID） ==========
// 在微信公众平台 -> 功能 -> 订阅消息 中申请
const VACCINE_TMPL_ID = "Lw3_o2d4mJKNtEM3Yrfxp_l17_2iBoxt6v77-6BvudA";
const DEWORM_TMPL_ID = "Lw3_o2d4mJKNtEM3Yrfxp_l17_2iBoxt6v77-6BvudA";
const FOOD_TMPL_ID = "Lw3_o2d4mJKNtEM3Yrfxp_l17_2iBoxt6v77-6BvudA";

// 提前提醒天数
const ADVANCE_DAYS = 7;

/**
 * 计算两个日期相差天数
 */
function diffInDays(d1, d2) {
  const a = new Date(d1);
  a.setHours(0, 0, 0, 0);
  const b = new Date(d2);
  b.setHours(0, 0, 0, 0);
  return Math.floor((a - b) / 86400000);
}

function getLatestDewormRecordsByType(records) {
  const latestByType = {};

  for (const rec of records) {
    const key = String(rec.type);
    const current = latestByType[key];
    if (!current || new Date(rec.dateTaken) > new Date(current.dateTaken)) {
      latestByType[key] = rec;
    }
  }

  return Object.keys(latestByType).map((key) => latestByType[key]);
}

/**
 * 发送订阅消息
 */
async function sendSubscribeMessage(openId, tmplId, data, page = "pages/index/index") {
  try {
    await cloud.openapi.subscribeMessage.send({
      touser: openId,
      templateId: tmplId,
      page,
      data,
      miniprogramState: "formal",
    });
    return true;
  } catch (e) {
    console.error("sendSubscribeMessage failed", openId, tmplId, e);
    return false;
  }
}

/**
 * 查询所有用户（按 _openId 分组）
 */
async function getAllUsers() {
  const db = cloud.database();
  const _ = db.command;
  const dogsCollection = db.collection("dogs");

  // 获取所有不同的 openId
  const result = await dogsCollection
    .aggregate()
    .group({ _id: "$_openId" })
    .end();

  return result.list.map((item) => item._id).filter(Boolean);
}

/**
 * 获取某个用户的所有临期提醒
 */
async function getUserReminders(openId) {
  const db = cloud.database();
  const _ = db.command;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + ADVANCE_DAYS);

  const reminders = [];

  // 查出该用户的所有狗狗
  const dogsRes = await db
    .collection("dogs")
    .where({ _openId: openId })
    .get();
  const dogs = dogsRes.data;

  for (const dog of dogs) {
    // 查疫苗
    const vaccineRes = await db
      .collection("vaccine_records")
      .where({
        dogId: dog._id,
        nextDueDate: _.and([_.gte(today), _.lte(futureDate)]),
      })
      .get();

    for (const rec of vaccineRes.data) {
      const days = diffInDays(new Date(rec.nextDueDate), today);
      reminders.push({
        type: "vaccine",
        dogName: dog.name,
        title: rec.vaccineType,
        date: rec.nextDueDate,
        days,
        recordId: rec._id,
      });
    }

    // 查驱虫
    const dewormRes = await db
      .collection("deworming_records")
      .where({
        dogId: dog._id,
      })
      .get();

    for (const rec of getLatestDewormRecordsByType(dewormRes.data)) {
      if (!rec.nextDueDate) continue;
      const days = diffInDays(new Date(rec.nextDueDate), today);
      if (days < 0 || days > ADVANCE_DAYS) continue;
      reminders.push({
        type: "deworm",
        dogName: dog.name,
        title: rec.brandName,
        date: rec.nextDueDate,
        days,
        recordId: rec._id,
      });
    }

    // 查存粮（按日消耗估算）
    const foodRes = await db
      .collection("food_stock_records")
      .where({ dogId: dog._id })
      .get();

    for (const rec of foodRes.data) {
      const remainingKg = Number(rec.remainingKg || 0);
      const dailyConsumeKg = Number(rec.dailyConsumeKg || 0);

      if (remainingKg > 0 && dailyConsumeKg > 0) {
        const estDays = Math.floor(remainingKg / dailyConsumeKg);
        if (estDays <= ADVANCE_DAYS) {
          reminders.push({
            type: "food",
            dogName: dog.name,
            title: rec.brandName,
            date: null,
            days: estDays,
            recordId: rec._id,
            remainingKg,
          });
        }
      } else if (remainingKg <= 0) {
        reminders.push({
          type: "food",
          dogName: dog.name,
          title: rec.brandName,
          date: null,
          days: -1,
          recordId: rec._id,
          remainingKg: 0,
        });
      }
    }
  }

  return reminders;
}

/**
 * 生成订阅消息的 data 字段
 * 格式取决于模板字段定义，以下为通用示例
 */
function buildMsgData(reminder) {
  if (reminder.type === "vaccine" || reminder.type === "deworm") {
    // 字段名需与模板一致
    const dateStr =
      reminder.date instanceof Date
        ? reminder.date.toISOString().slice(0, 10)
        : String(reminder.date).slice(0, 10);
    return {
      thing1: { value: reminder.dogName + " - " + reminder.title },
      date2: { value: dateStr },
      thing3: { value: reminder.days === 0 ? "今天到期" : reminder.days + "天后到期" },
    };
  } else if (reminder.type === "food") {
    return {
      thing1: { value: reminder.dogName + " - " + reminder.title },
      number2: { value: String(reminder.remainingKg) + "kg" },
      thing3: {
        value: reminder.days <= 0 ? "已缺粮" : reminder.days + "天后缺粮",
      },
    };
  }
  return null;
}

/**
 * 云函数入口
 */
exports.main = async (event, context) => {
  console.log("checkReminders triggered", event);

  const users = await getAllUsers();
  console.log("total users:", users.length);

  let sentCount = 0;
  let failCount = 0;

  for (const openId of users) {
    const reminders = await getUserReminders(openId);
    console.log(`user ${openId} reminders:`, reminders.length);

    for (const r of reminders) {
      let tmplId = null;
      if (r.type === "vaccine") tmplId = VACCINE_TMPL_ID;
      else if (r.type === "deworm") tmplId = DEWORM_TMPL_ID;
      else if (r.type === "food") tmplId = FOOD_TMPL_ID;

      if (!tmplId) continue;

      const data = buildMsgData(r);
      if (!data) continue;

      const ok = await sendSubscribeMessage(openId, tmplId, data);
      if (ok) sentCount++;
      else failCount++;
    }
  }

  return {
    success: true,
    totalUsers: users.length,
    sentCount,
    failCount,
  };
};
