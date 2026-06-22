import roadmapJson from './HITU_Roadmap_EN.json';

export const roadmapData = roadmapJson;

export const departments = roadmapJson.departments;

export const getDepartmentByName = (name) => {
  return departments.find(dept => dept.name === name);
};

export const getYearsByDepartment = (deptName) => {
  const dept = getDepartmentByName(deptName);
  if (!dept) return [];
  return Object.keys(dept.roadmap)
    .filter(key => key.startsWith('year_'))
    .map(key => ({
      id: key,
      label: dept.roadmap[key].label
    }));
};

export const getSubjectsByYear = (deptName, yearId) => {
  const dept = getDepartmentByName(deptName);
  if (!dept || !dept.roadmap[yearId]) return [];
  return dept.roadmap[yearId].subjects; // Returns [{id, name}, ...]
};
