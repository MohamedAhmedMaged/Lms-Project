import { lessonService } from "../Services/LessonService.js";
import { catchAsync } from "../Utils/catchAsync.js";

class LessonController 
{
    GetAllLessons = catchAsync(async (req, res) => {
        const lessons = await lessonService.GetCourseLessons(
            req.params.courseId,
            req.user?.id
        );
        
        res.status(200).json({
            status: 'success',
            results: lessons.length,
            data: lessons
        });
    });

    GetLessonById = catchAsync(async (req, res) => {
        const lesson = await lessonService.GetLessonById(
            req.params.id,
            req.user?.id
        );
        
        res.status(200).json({
            status: 'success',
            data: lesson
        });
    });

    CreateLesson = catchAsync(async (req, res) => {
        const lessonData = {
            ...req.body,
            courseId: req.params.courseId
        };
        
        const lesson = await lessonService.CreateLesson(lessonData, req.user.id);
        
        res.status(201).json({
            status: 'success',
            data: lesson
        });
    });

    UpdateLesson = catchAsync(async (req, res) => {
        const lesson = await lessonService.UpdateLesson(
            req.params.id,
            req.user.id,
            req.body
        );
        
        res.status(200).json({
            status: 'success',
            data: lesson
        });
    });

    DeleteLesson = catchAsync(async (req, res) => {
        const result = await lessonService.DeleteLesson(
            req.params.id,
            req.user.id
        );
        
        res.status(200).json({
            status: 'success',
            data: result
        });
    });
}

export const lessonController = new LessonController();
