import { getCollection } from 'astro:content';
import { addDurationToProject } from './dateHelpers';
import { filterForProduction } from './contentVisibility';

// Get all projects with duration calculated
export const getProjectsWithDuration = async () => {
  const projects = filterForProduction(await getCollection('projects'));
  return projects.map((project) => ({
    ...project,
    data: addDurationToProject(project.data),
  }));
};

// Get a single project with duration calculated
export const getProjectWithDuration = async (id: string) => {
  const projects = filterForProduction(await getCollection('projects'));
  const project = projects.find((p) => p.id === id);
  if (!project) return null;

  return {
    ...project,
    data: addDurationToProject(project.data),
  };
};
