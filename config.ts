const USER_DELIMITER = ',';

const bucket1Users = process.env['BUCKET_1'].split(USER_DELIMITER);
const bucket2Users = process.env['BUCKET_2'].split(USER_DELIMITER);

export default {
  collectionName: 'users',
  botToken: process.env['BOT_TOKEN'],
  botName: process.env['BOT_NAME'],
  firebaseConfig: JSON.parse(process.env['FIREBASE_CONFIG']),
  endOfPeriodDay: parseInt(process.env['END_OF_PERIOD_DAY'], 10),
  buckets: [bucket1Users, bucket2Users]
};
