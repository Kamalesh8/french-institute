// Mock function for getCourses
export const getCourses = async (options: any) => {
  console.log("getCourses called with options:", options);
  return {
    courses: [],
    lastVisible: null
  };
};

