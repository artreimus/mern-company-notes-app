const createTokenUser = (user) => {
  return { username: user.username, userId: user._id, roles: user.roles };
};

module.exports = createTokenUser;
