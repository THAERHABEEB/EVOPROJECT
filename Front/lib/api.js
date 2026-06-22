/**
 * Centralized API client for the EVO project.
 * Handles requests to the backend server running on port 5000.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Custom error class for API responses
 */
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Base request function with token handling and error management
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  // Get token from localStorage (if available)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(result.error || 'Something went wrong', response.status, result);
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error.message || 'Network error', 500);
  }
}

/**
 * Factory for standard CRUD operations
 */
const createResource = (resource) => ({
  getAll: (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return request(`/${resource}${query}`);
  },
  getById: (id) => request(`/${resource}/${id}`),
  create: (data) => request(`/${resource}`, { method: 'POST', body: data }),
  update: (id, data) => request(`/${resource}/${id}`, { method: 'PUT', body: data }),
  patch: (id, data) => request(`/${resource}/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => request(`/${resource}/${id}`, { method: 'DELETE' }),
});

export const api = {
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    // Example: api.auth.login({ id: '123', password: 'password' })
  },
  
  // Standard resources
  users: createResource('USER'),
  admin: createResource('admin'),
  assignments: createResource('assignment'),
  attendance: createResource('attendance'),
  buildings: createResource('building'),
  control: createResource('control'),
  courses: {
    ...createResource('course'),
    getStudents: (id) => request(`/course/${id}/students`),
  },
  doctors: {
    ...createResource('doctor'),
    getCourses: (id) => request(`/doctor/${id}/courses`),
  },
  enrollments: createResource('enrollments'),
  faq: createResource('faq'),
  grades: {
    ...createResource('grade'),
    getByStudentId: (studentId) => request(`/grade/student/${studentId}`),
  },
  lectures: createResource('lecture'),
  lectureMaterials: createResource('lecture_materials'),
  library: createResource('library'),
  live: createResource('live'),
  messages: createResource('messages'),
  news: createResource('news'),
  requestTypes: createResource('request_type'),
  semesters: createResource('semesters'),
  specializations: createResource('specialization'),
  studentAffairs: createResource('student_affairs'),
  studentRequests: createResource('student_request'),
  students: {
    ...createResource('students'),
    getByUserId: (userId) => request(`/students/user/${userId}`),
  },
  // Helper to update specialization specifically
  studentsSpecialization: {
    update: (id, data) => request(`/students/${id}/specialization`, { method: 'PUT', body: data }),
    roadmap: (id) => request(`/students/${id}/roadmap`),
  },
  studyPlan: createResource('study_plan'),
  uploadGrades: {
    ...createResource('upload_grades'),
    submit: (data) => request('/upload_grades/submit', { method: 'POST', body: data }),
  },
  
  // Custom or nested routes can be added here
  tables: {
    get: () => request('/tabels'),
  },
  
  health: () => request('/health', { method: 'GET' }),
};

export default api;
