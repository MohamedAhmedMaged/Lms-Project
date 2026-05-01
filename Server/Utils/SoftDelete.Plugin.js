import mongoose from "mongoose";

export const SoftDeletePlugin = (schema) => {
  schema.add({
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  schema.virtual("isDeleted").get(function () {
    return this.deletedAt !== null;
  });

  schema.methods.softDelete = async function () {
    this.deletedAt = new Date();
    return this.save();
  };

  schema.methods.restore = async function () {
    this.deletedAt = null;
    return this.save();
  };

  schema.statics.findActive = function (filter = {}) {
    return this.find({
      ...filter,
      deletedAt: null,
    });
  };

  schema.statics.findDeleted = function (filter = {}) {
    return this.find({
      ...filter,
      deletedAt: { $ne: null },
    });
  };

  schema.statics.softDeleteById = async function (id) {
    const doc = await this.findById(id);
    if (!doc) return null;
    return doc.softDelete();
  };

  schema.statics.restoreById = async function (id) {
    const doc = await this.findOne({ _id: id, deletedAt: { $ne: null } });
    if (!doc) return null;
    return doc.restore();
  };

  const filterDeleted = function (next) {
    const options = this.getOptions ? this.getOptions() : {};
    if (!options.includeDeleted) {
      this.where({ deletedAt: null });
    }
    next();
  };

  schema.pre("find", filterDeleted);
  schema.pre("findOne", filterDeleted);
  schema.pre("findOneAndUpdate", filterDeleted);
  schema.pre("countDocuments", filterDeleted);
  schema.pre("updateMany", filterDeleted);
};
