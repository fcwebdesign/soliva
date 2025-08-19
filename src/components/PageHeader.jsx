import FormattedText from './FormattedText';

const PageHeader = ({ 
  title, 
  subtitle, 
  description, 
  className = "contact-description",
  titleClassName = ""
}) => {
  return (
    <>
      <h1 className={titleClassName}>{title}</h1>
      
      {/* Description sous le titre */}
      {description && (
        <div className={className}>
          <FormattedText>
            {description}
          </FormattedText>
        </div>
      )}
    </>
  );
};

export default PageHeader; 