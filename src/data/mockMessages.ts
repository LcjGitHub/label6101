import type { PagerMessage } from '../types/pager'

export const mockMessages: PagerMessage[] = [
  { id: '001', number: '13801234567', time: '1998-03-15 08:23', content: '会议改至下午3点，请准时到场。', read: true },
  { id: '002', number: '13987654321', time: '1998-03-15 09:47', content: '货已发出，单号8827361，请注意查收。', read: true },
  { id: '003', number: '010-62345678', time: '1998-03-15 11:02', content: '请回电，有急事找你。', read: false },
  { id: '004', number: '13611112222', time: '1998-03-15 12:18', content: '今晚聚餐，老地方见，7点半。', read: false },
  { id: '005', number: '021-55667788', time: '1998-03-15 14:35', content: '合同已签，传真件稍后发送。', read: true },
  { id: '006', number: '13799887766', time: '1998-03-15 16:09', content: '明天上午来厂验货，带好样品。', read: false },
  { id: '007', number: '13801234567', time: '1998-03-16 07:55', content: '火车票已订，K256次，18号出发。', read: true },
  { id: '008', number: '13901239876', time: '1998-03-16 09:30', content: '妈：记得带伞，今天有雨。', read: false },
  { id: '009', number: '010-88990011', time: '1998-03-16 10:44', content: 'BP机测试正常，信号强度良好。', read: true },
  { id: '010', number: '13566778899', time: '1998-03-16 13:22', content: '欠款已汇，请查收并回复。', read: false },
  { id: '011', number: '13611112222', time: '1998-03-16 15:08', content: '项目进度如何？请尽快汇报。', read: true },
  { id: '012', number: '13801234567', time: '1998-03-16 17:41', content: '周末加班安排已确认，谢谢配合。', read: false },
  { id: '013', number: '021-33445566', time: '1998-03-17 08:12', content: '新样品已到，请来办公室领取。', read: true },
  { id: '014', number: '13987654321', time: '1998-03-17 09:58', content: '客户投诉已处理，无需担心。', read: false },
  { id: '015', number: '13744556677', time: '1998-03-17 11:33', content: '寻呼台：您有1条未读留言。', read: false },
  { id: '016', number: '010-62345678', time: '1998-03-17 14:07', content: '发票已开好，明天自取。', read: true },
  { id: '017', number: '13688990011', time: '1998-03-17 16:25', content: '车已在楼下等候，请下楼。', read: false },
  { id: '018', number: '13877665544', time: '1998-03-17 18:50', content: '生日快乐！晚上给你惊喜。', read: true },
  { id: '019', number: '13901239876', time: '1998-03-17 20:15', content: '到家了，一切平安，勿念。', read: false },
  { id: '020', number: '13566778899', time: '1998-03-17 22:03', content: '明早8点集合，带好证件。', read: false },
]
