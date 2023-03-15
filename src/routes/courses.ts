import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import {
  conditionalUpdate,
  deleteCourseByCourseId,
  getCourseByCourseId,
  getCoursesByDepartmentId,
  getDepartmentBySlug,
  insertCourse,
} from '../lib/db.js';
import { courseMapper } from '../lib/mappers.js';
import {
  atLeastOneBodyValueValidator,
  courseIdDoesNotExistValidator,
  courseTitleDoesNotExistValidator,
  genericSanitizerMany,
  semesterValidator,
  stringValidator,
  validationCheck,
  xssSanitizerMany,
} from '../lib/validation.js';
import { Course } from '../types.js';

export async function listCourses(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug } = req.params;

  const department = await getDepartmentBySlug(slug);

  if (!department) {
    return next();
  }

  const courses = await getCoursesByDepartmentId(department.id);

  if (!courses) {
    return next(new Error('unable to get courses'));
  }

  return res.json(courses);
}

export async function getCourse(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug, courseId } = req.params;

  const department = await getDepartmentBySlug(slug);

  if (!department) {
    return next();
  }

  const course = await getCourseByCourseId(courseId);

  if (!course) {
    return next();
  }

  return res.json(course);
}

export async function createCoursesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug } = req.params;
  const { courseId, title, units, semester, level, url } = req.body;

  const department = await getDepartmentBySlug(slug);

  if (!department) {
    return next();
  }

  const courseToCreate: Omit<Course, 'id'> = {
    title,
    units,
    semester,
    level,
    url,
    courseId,
  };

  const createdCourse = await insertCourse(
    courseToCreate,
    department.id,
    false,
  );

  if (!createdCourse) {
    return next(new Error('unable to create course'));
  }

  return res.json(courseMapper(createdCourse));
}

const courseFields = ['courseId', 'title', 'level', 'url', 'semester', 'units'];

export const createCourse = [
  stringValidator({ field: 'courseId', maxLength: 16 }),
  stringValidator({ field: 'title', maxLength: 64 }),
  body('units')
    .isFloat({ min: 0.5, max: 100 })
    .withMessage('units must be a number between 0.5 and 100'),
  semesterValidator({ field: 'semester' }),
  stringValidator({ field: 'level', valueRequired: false, maxLength: 128 }),
  stringValidator({ field: 'url', valueRequired: false, maxLength: 256 }),
  courseTitleDoesNotExistValidator,
  courseIdDoesNotExistValidator,
  xssSanitizerMany(courseFields),
  validationCheck,
  genericSanitizerMany(courseFields),
  createCoursesHandler,
].flat();

export const updateCourse = [
  stringValidator({ field: 'courseId', maxLength: 16, optional: true }),
  stringValidator({ field: 'title', maxLength: 64, optional: true }),
  body('units')
    .isFloat({ min: 0.5, max: 100 })
    .withMessage('units must be a number between 0.5 and 100')
    .optional(),
  semesterValidator({ field: 'semester', optional: true }),
  stringValidator({
    field: 'level',
    valueRequired: false,
    maxLength: 128,
    optional: true,
  }),
  stringValidator({
    field: 'url',
    valueRequired: false,
    maxLength: 256,
    optional: true,
  }),
  atLeastOneBodyValueValidator(courseFields),
  courseTitleDoesNotExistValidator,
  courseIdDoesNotExistValidator,
  xssSanitizerMany(courseFields),
  validationCheck,
  genericSanitizerMany(courseFields),
  updateCourseHandler,
].flat();

export async function updateCourseHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug, courseId } = req.params;
  const department = await getDepartmentBySlug(slug);

  if (!department) {
    return next();
  }

  const course = await getCourseByCourseId(courseId);

  if (!course) {
    return next();
  }

  const {
    courseId: newCourseId,
    title,
    level,
    url,
    semester,
    units,
  } = req.body;

  const fields = [
    typeof newCourseId === 'string' && newCourseId ? 'course_id' : null,
    typeof title === 'string' && title ? 'title' : null,
    typeof level === 'string' && level ? 'level' : null,
    typeof url === 'string' && url ? 'url' : null,
    typeof semester === 'string' && semester ? 'semester' : null,
    typeof units === 'string' && units ? 'units' : null,
  ];

  const values = [
    typeof newCourseId === 'string' && newCourseId ? newCourseId : null,
    typeof title === 'string' && title ? title : null,
    typeof level === 'string' && level ? level : null,
    typeof url === 'string' && url ? url : null,
    typeof semester === 'string' && semester ? semester : null,
    typeof units === 'string' && units ? units : null,
  ];

  const updated = await conditionalUpdate('course', course.id, fields, values);
  console.log('updated :>> ', updated);
  if (!updated) {
    return next(new Error('unable to update course'));
  }

  const updatedCourse = courseMapper(updated.rows[0]);
  return res.json(updatedCourse);
}

export async function deleteCourse(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { slug, courseId } = req.params;

  const department = await getDepartmentBySlug(slug);

  if (!department) {
    return next();
  }

  const course = await getCourseByCourseId(courseId);

  if (!course) {
    return next();
  }

  const result = await deleteCourseByCourseId(courseId);

  if (!result) {
    return next(new Error('unable to delete course'));
  }

  return res.status(204).json({});
}
