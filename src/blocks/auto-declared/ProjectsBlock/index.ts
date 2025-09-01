import { registerAutoBlock } from '../registry';
import ProjectsBlock from './component';
import ProjectsBlockEditor from './editor';

registerAutoBlock({
  type: 'projects',
  component: ProjectsBlock,
  editor: ProjectsBlockEditor,
  defaultData: {
    title: 'NOS RÉALISATIONS',
    maxProjects: 6,
    selectedProjects: [],
    theme: 'auto'
  }
});
