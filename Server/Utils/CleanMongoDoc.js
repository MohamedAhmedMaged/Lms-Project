export const cleanMongoDoc = (doc) => {
  if (!doc) return null;

  const clean = { ...doc };
  delete clean._id;
  delete clean.__v;
  delete clean.password;
  delete clean.deletedAt;

  if (clean._id) {
    clean.id = clean._id.toString();
  }

  return clean;
};

export const cleanMongoDocs = (docs) => {
  if (!Array.isArray(docs)) return [];
  return docs.map(cleanMongoDoc);
};
