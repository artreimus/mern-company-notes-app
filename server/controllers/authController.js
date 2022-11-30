const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

// @desc Login
// @route POST /auth
// @access Public

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new CustomError.BadRequestError(
      'Please provide username and password'
    );
  }

  const foundUser = await User.findOne({ username }).exec();

  if (!foundUser || !foundUser.active) {
    throw new CustomError.UnauthorizedError('Invalid credentials');
  }

  const isPasswordCorrect = await foundUser.comparePassword(password);

  if (!isPasswordCorrect)
    throw new CustomError.UnauthorizedError('Invalid credentials');

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    {
      username: foundUser.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // accessible only by web server
    secure: true, // https
    sameSite: 'None', // cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiry set to match refreshToken
  });

  res.status(StatusCodes.OK).json({ accessToken });
});

// @desc Refresh Token
// @route GET /auth/refresh
// @access Public - because token has expired

const refresh = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    throw new CustomError.UnauthorizedError('Invalid credentials');
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err)
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: 'Invalid token' });

      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec();

      if (!foundUser) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: 'Invalid token. User not found' });
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );

      res.status(StatusCodes.OK).json({ accessToken });
    })
  );
});

// @desc Refresh Token
// @route {POST} /auth/logout
// @access Public - just to clearn cookie if exists

const logout = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    throw new CustomError.BadRequestError('No content');
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  });
  res.status(StatusCodes.OK).json({ message: 'Cookie successfully Cleared' });
});

module.exports = { login, refresh, logout };
