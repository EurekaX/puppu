const assert = require("assert");

const store = {
  dogs: [],
  vaccine_records: [],
  deworming_records: [],
  food_stock_records: [],
};

global.wx = {
  getStorageSync(key) {
    return store[key] || [];
  },
  setStorageSync(key, value) {
    store[key] = value;
  },
};

const storage = require("../miniprogram/utils/storage");

function resetStore() {
  store.dogs = [];
  store.vaccine_records = [];
  store.deworming_records = [];
  store.food_stock_records = [];
}

function testLatestDewormRecordPerTypeControlsReminder() {
  resetStore();
  store.deworming_records = [
    {
      _id: "old_inner",
      dogId: "dog_1",
      type: 0,
      brandName: "Old inner",
      dateTaken: "2026-05-01",
      nextDueDate: "2026-06-12",
    },
    {
      _id: "new_inner",
      dogId: "dog_1",
      type: 0,
      brandName: "New inner",
      dateTaken: "2026-06-10",
      nextDueDate: "2026-07-10",
    },
    {
      _id: "outer",
      dogId: "dog_1",
      type: 1,
      brandName: "Outer",
      dateTaken: "2026-05-10",
      nextDueDate: "2026-06-12",
    },
  ];

  const reminders = storage.getUpcomingReminders("dog_1", 7);
  const dewormRecordIds = reminders
    .filter((item) => item.type === "deworm")
    .map((item) => item.recordId);

  assert.deepStrictEqual(dewormRecordIds, ["outer"]);
}

testLatestDewormRecordPerTypeControlsReminder();
console.log("storage reminder tests passed");
