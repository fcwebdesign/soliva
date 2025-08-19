import FormattedText from './FormattedText';

const BlockRenderer = ({ blocks = [] }) => {
  const renderBlock = (block) => {
    switch (block.type) {
      case 'content':
        return (
          <div key={block.id} className="block-content">
            <FormattedText>
              {block.content}
            </FormattedText>
          </div>
        );
      
      case 'h2':
        return (
          <h2 key={block.id} className="block-h2">
            {block.content}
          </h2>
        );
      
      case 'image':
        return (
          <div key={block.id} className="block-image">
            <img 
              src={block.image?.src} 
              alt={block.image?.alt || ''} 
              className="w-full h-auto"
            />
          </div>
        );
      
      default:
        return (
          <div key={block.id} className="block-unknown">
            <p>Type de bloc non reconnu: {block.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="blocks-container">
      {blocks.map(renderBlock)}
    </div>
  );
};

export default BlockRenderer; 