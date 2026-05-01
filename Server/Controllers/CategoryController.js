import { categoryService } from "../Services/CategoryService.js";
import { catchAsync } from "../Utils/catchAsync.js";

class CategoryController 
{
    CreateCategory = catchAsync(async (req, res) => {
        const category = await categoryService.CreateCategory(req.body);
        
        res.status(201).json({
            status: 'success',
            data: category
        });
    });

    GetAllCategories = catchAsync(async (req, res) => {
        const categories = await categoryService.GetAllCategories();
        
        res.status(200).json({
            status: 'success',
            results: categories.length,
            data: categories
        });
    });

    GetCategoryTree = catchAsync(async (req, res) => {
        const tree = await categoryService.GetCategoryTree();
        
        res.status(200).json({
            status: 'success',
            data: tree
        });
    });

    GetCategoryBySlug = catchAsync(async (req, res) => {
        const category = await categoryService.GetCategoryBySlug(req.params.slug);
        
        res.status(200).json({
            status: 'success',
            data: category
        });
    });

    UpdateCategory = catchAsync(async (req, res) => {
        const category = await categoryService.UpdateCategory(
            req.params.id,
            req.body
        );
        
        res.status(200).json({
            status: 'success',
            data: category
        });
    });

    DeleteCategory = catchAsync(async (req, res) => {
        const result = await categoryService.DeleteCategory(req.params.id);
        
        res.status(200).json({
            status: 'success',
            data: result
        });
    });
}

export const categoryController = new CategoryController();
