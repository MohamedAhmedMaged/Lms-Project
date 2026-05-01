import { CategoryModel } from "../Models/Category.js";
import { CourseModel } from "../Models/Course.js";
import slugify from "slugify";
import { GenericErrors } from "../Errors/CustomErrors.js";

class CategoryService {
  async CreateCategory(categoryData) {
    const { name, description, parent } = categoryData;

    const slug = slugify(name, { lower: true, strict: true });

    const existingCategory = await CategoryModel.findOne({
      $or: [{ name }, { slug }],
    });

    if (existingCategory) {
      throw GenericErrors.duplicateData(
        "Category",
        "Category with this name already exists",
      );
    }

    const category = await CategoryModel.create({
      name,
      slug,
      description,
      parent,
    });

    return category;
  }

  async GetAllCategories() {
    const categories = await CategoryModel.find({ isActive: true }).sort({
      name: 1,
    });

    return categories;
  }

  async GetCategoryBySlug(slug) {
    const category = await CategoryModel.findOne({ slug, isActive: true });

    if (!category) {
      throw GenericErrors.elementNotFound("Category");
    }

    return category;
  }

  async UpdateCategory(categoryId, updateData) {
    const category = await CategoryModel.findById(categoryId);

    if (!category) {
      throw GenericErrors.elementNotFound("Category");
    }

    if (updateData.name) {
      updateData.slug = slugify(updateData.name, { lower: true, strict: true });

      const existingCategory = await CategoryModel.findOne({
        slug: updateData.slug,
        _id: { $ne: categoryId },
      });

      if (existingCategory) {
        throw GenericErrors.duplicateData(
          "Category",
          "Category with this name already exists",
        );
      }
    }

    Object.assign(category, updateData);
    await category.save();

    return category;
  }

  async DeleteCategory(categoryId) {
    const category = await CategoryModel.findById(categoryId);

    if (!category) {
      throw GenericErrors.elementNotFound("Category");
    }

    const coursesCount = await CourseModel.countDocuments({
      category: categoryId,
    });

    if (coursesCount > 0) {
      throw GenericErrors.invalidInput(
        "Cannot delete category with existing courses",
        "category_has_courses",
      );
    }

    await category.softDelete();

    return { message: "Category deleted successfully" };
  }

  async GetCategoryTree() {
    const categories = await CategoryModel.find({ isActive: true }).sort({
      name: 1,
    });

    const buildTree = (parentId = null) => {
      return categories
        .filter((cat) => String(cat.parent) === String(parentId))
        .map((cat) => ({
          ...cat.toObject(),
          children: buildTree(cat._id),
        }));
    };

    return buildTree();
  }
}

export const categoryService = new CategoryService();
