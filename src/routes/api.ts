import express, { Request, Response } from 'express';
import {
  createCourse,
  deleteCourse,
  getCourse,
  listCourses,
  updateCourse,
} from './courses.js';
import {
  createDepartment,
  deleteDepartment,
  getDepartment,
  listDepartments,
  updateDepartment,
} from './departments.js';

export const router = express.Router();

export async function index(req: Request, res: Response) {
  return res.json([
    {
      href: '/departments',
      methods: ['GET', 'POST'],
    },
    {
      href: '/departments/:slug',
      methods: ['GET', 'PATCH', 'DELETE'],
    },
    {
      href: '/departments/:slug/courses',
      methods: ['GET', 'POST'],
    },
    {
      href: '/departments/:slug/courses/:courseId',
      methods: ['GET', 'PATCH', 'DELETE'],
    },
  ]);
}

// Departments
router.get('/', index);
router.get('/departments', listDepartments);
router.post('/departments', createDepartment);
router.get('/departments/:slug', getDepartment);
router.patch('/departments/:slug', updateDepartment);
router.delete('/departments/:slug', deleteDepartment);

// Courses
router.get('/departments/:slug/courses', listCourses);
router.post('/departments/:slug/courses', createCourse);
router.get('/departments/:slug/courses/:courseId', getCourse);
router.patch('/departments/:slug/courses/:courseId', updateCourse);
router.delete('/departments/:slug/courses/:courseId', deleteCourse);
