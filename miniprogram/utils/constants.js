const BREEDS = [
  '边境牧羊犬', '金毛寻回犬', '拉布拉多', '贵宾犬', '泰迪',
  '柯基犬', '柴犬', '哈士奇', '萨摩耶', '阿拉斯加',
  '德国牧羊犬', '法国斗牛犬', '英国斗牛犬', '博美犬', '吉娃娃',
  '雪纳瑞', '比熊', '约克夏', '巴哥犬', '腊肠犬',
  '松狮犬', '京巴犬', '西高地白梗', '马尔济斯', '秋田犬',
  '中华田园犬', '比格犬', '杜宾犬', '罗威纳', '大丹犬'
];

const VACCINE_TYPES = [
  { label: '核心联苗-第一针', value: 'combo_1', intervalDays: 21 },
  { label: '核心联苗-第二针', value: 'combo_2', intervalDays: 21 },
  { label: '核心联苗-第三针', value: 'combo_3', intervalDays: 21 },
  { label: '核心联苗-加强针', value: 'combo_booster', intervalDays: 365 },
  { label: '狂犬疫苗', value: 'rabies', intervalDays: 365 },
  { label: '其他疫苗', value: 'other', intervalDays: 365 }
];

const DEWORM_TYPES = [
  { label: '体内驱虫', value: 0 },
  { label: '体外驱虫', value: 1 },
  { label: '内外同驱', value: 2 }
];

const DEWORM_BRANDS = [
  '犬心保', '超可信', '大宠爱', '福来恩', '拜宠清',
  '尼可信', '贝卫多', '爱沃克', '海乐宠', '海乐妙'
];

const DEWORM_CYCLES = [
  { label: '1个月', value: 1 },
  { label: '3个月', value: 3 },
  { label: '6个月', value: 6 },
  { label: '自定义', value: 0 }
];

const GENDER_OPTIONS = [
  { label: '弟弟', value: 0 },
  { label: '妹妹', value: 1 },
  { label: '已绝育公犬', value: 2 },
  { label: '已绝育母犬', value: 3 }
];

module.exports = {
  BREEDS,
  VACCINE_TYPES,
  DEWORM_TYPES,
  DEWORM_BRANDS,
  DEWORM_CYCLES,
  GENDER_OPTIONS
};
