import { sign, verify } from "jsonwebtoken";
import { hash, compare } from "bcryptjs";
import { IUser } from "../models/User";

interface TokenData {
  userId: number;
  userRole: string;
}
const { APP_SECRET = "TechAcrossDimensions" } = process.env;

export const hashPwd = (password: string) => hash(password, 10);

export const comparePwd = (password: string, hashPassword: string) =>
  compare(password, hashPassword);

export const signToken = (user: IUser): string => {
  return sign(
    {
      userId: user.id,
      userRole: user.role
    },
    APP_SECRET
  );
};
export const verifyToken = (token: string): TokenData =>
  verify(token, APP_SECRET) as TokenData;

export const getTokenData = (token: string): TokenData => {
  token = token.replace(/^Bearer /, "");
  return verifyToken(token);
};

export const sleep = async (milliseconds = 500) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const reduceConfig = items => {
  return items.reduce((acc, cur) => {
    const curObj = cur.toObject();
    ["_id", "__v", "createdAt", "updatedAt"].forEach(k => {
      delete curObj[k];
    });
    return Object.assign(acc, curObj);
  }, {});
};

export const parseSortString = orderString => {
  if (!orderString) {
    return;
  }

  const sort = orderString.split(",").reduce((acc, seg) => {
    const matches = seg.match(/^(-?)(.*)$/);
    acc[matches[2]] = matches[1] === "-" ? -1 : 1;
    return acc;
  }, {});

  return sort;
};
