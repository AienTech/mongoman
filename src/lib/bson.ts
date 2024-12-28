// THIS FILE IS A COPY OF
// https://github.com/mongo-express/mongo-express/blob/master/lib/bson.js

import parser, { toJSString } from 'mongodb-query-parser';
import { BSON, ObjectId } from 'bson';

const { EJSON } = BSON;

export const toSafeBSON = (string: string) => {
  try {
    return parser(string);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const parseObjectId = (string: string) => {
  if (/^[\da-f]{24}$/i.test(string)) {
    return new ObjectId(string);
  }
  return parser(string);
};

export const toString = function (doc: unknown) {
  return toJSString(doc, '    ');
};

export const toJsonString = function (doc: unknown) {
  return EJSON.stringify(EJSON.serialize(doc));
};
