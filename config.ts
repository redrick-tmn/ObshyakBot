const USER_DELIMITER = ',';

const group1Users = (process.env['BUCKET_1'] || '').split(USER_DELIMITER);
const group2Users = (process.env['BUCKET_2'] || '').split(USER_DELIMITER);

export default {
  usersCollectionName: process.env['USERS_COLLECTION_NAME'] || '',
  periodsCollectionName: process.env['PERIODS_COLLECTION_NAME'] || '',
  botToken: process.env['BOT_TOKEN'] || '',
  botName: process.env['BOT_NAME'] || '',
  groups: [group1Users, group2Users],
  timezone: 'Europe/Moscow'
};
