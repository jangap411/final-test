const { Model, DataTypes, Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./temp.db",
});

class User extends Model {}
User.init(
  {
    role: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
  },
  { sequelize }
);

class Message extends Model {}
Message.init(
  {
    content: DataTypes.STRING,
    time: DataTypes.TIME,
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  { sequelize }
);

User.hasMany(Message);
Message.belongsTo(User);

(async () => {
  sequelize.sync({ force: false });
})();

module.exports = {
  User,
  Message,
  sequelize,
};
