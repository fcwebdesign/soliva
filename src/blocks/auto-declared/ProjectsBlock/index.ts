import { registerAutoBlock } from '../registry';
import ProjectsBlock from './component';
import ProjectsBlockEditor from './editor';

registerAutoBlock({
  type: 'projects',
  component: ProjectsBlock,
  editor: ProjectsBlockEditor,
  label: 'Projets',
  icon: '📁',
  category: 'content',
  description: 'Liste de projets (grid)',
  defaultData: {
    title: 'NOS RÉALISATIONS',
    maxProjects: 6,
    selectedProjects: [],
    theme: 'auto',
    columns: 3
  }
});
