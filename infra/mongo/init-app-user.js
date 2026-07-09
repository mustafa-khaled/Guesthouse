db = db.getSiblingDB('guesthouse');

const appUser = process.env.MONGO_APP_USERNAME || 'guesthouse_app';
const appPassword = process.env.MONGO_APP_PASSWORD;

if (!appPassword) {
  print('MONGO_APP_PASSWORD not set — skipping app user creation');
  quit(0);
}

db.createUser({
  user: appUser,
  pwd: appPassword,
  roles: [{ role: 'readWrite', db: 'guesthouse' }],
});

print(`Created application user: ${appUser}`);
