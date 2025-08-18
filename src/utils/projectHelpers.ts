import { getCollection } from 'astro:content';
import { addDurationToProject } from './dateHelpers';

// Get all projects with duration calculated
export const getProjectsWithDuration = async () => {
  const projects = await getCollection('projects');
  return projects.map(project => ({
    ...project,
    data: addDurationToProject(project.data)
  }));
};

// Get a single project with duration calculated
export const getProjectWithDuration = async (id: string) => {
  const projects = await getCollection('projects');
  const project = projects.find(p => p.id === id);
  if (!project) return null;
  
  return {
    ...project,
    data: addDurationToProject(project.data)
  };
};
