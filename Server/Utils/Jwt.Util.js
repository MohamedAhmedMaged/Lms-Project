import jwt from "jsonwebtoken";

const getJwtSecret = () => process.env.Jwt_Secret;
const getJwtRefreshSecret = () => process.env.Jwt_Refresh_Secret;
const getAccessTokenExpires = () => process.env.ACCESS_TOKEN_EXPIRES;
const getRefreshTokenExpires = () => process.env.REFRESH_TOKEN_EXPIRES;

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getAccessTokenExpires(),
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, getJwtRefreshSecret(), {
    expiresIn: getRefreshTokenExpires(),
  });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, getJwtRefreshSecret());
  } catch (error) {
    return null;
  }
};

export const generateTokens = (userId, role = "user") => {
  const accessToken = generateAccessToken({ userId, role });
  const refreshToken = generateRefreshToken({ userId });

  return { accessToken, refreshToken };
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};

export const getTokenExpiration = (token) => {
  const decoded = decodeToken(token);
  return decoded?.exp || null;
};
