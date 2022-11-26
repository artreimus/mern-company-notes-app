const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// @desc Login
// @route POST /auth
// @access Public

const login = asyncHandler(async (req, res) => {
  console.log('login');

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const foundUser = await User.findOne({ username }).exec();

  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: 'Unauthorized. User not found' });
  }

  const isPasswordCorrect = await foundUser.comparePassword(password);

  if (!isPasswordCorrect)
    return res
      .status(401)
      .json({ message: 'Unauthorized. Incorrect Password' });

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '10m' }
  );

  const refreshToken = jwt.sign(
    {
      username: foundUser.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  );

  res.cookie('jwt', refreshToken, {
    httpOnly: true, // accessible only by web server
    secure: true, // https
    sameSite: 'None', // cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiry set to match refreshToken
  });

  res.json({ accessToken });
});

// @desc Refresh Token
// @route GET /auth/refresh
// @access Public - because token has expired

const refresh = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(401).json({ message: 'Unauthorized. Refresh token' });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Forbidden' });

      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec();

      if (!foundUser)
        return res.status(401).json({ message: 'Unauthorized. Invalid token' });

      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '10m' }
      );

      res.json({ accessToken });
    })
  );
});

// @desc Refresh Token
// @route {POST} /auth/logout
// @access Public - just to clearn cookie if exists

const logout = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(204).json({ message: 'No content' });
  }

  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
  res.status(200).json({ message: 'Cookie Cleared' });
});

module.exports = { login, refresh, logout };
