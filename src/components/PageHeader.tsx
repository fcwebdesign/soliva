import FormattedText from './FormattedText';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
  titleClassName?: string;
  sticky?: boolean;
  stickyTop?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle = "", 
  description, 
  className = "contact-description",
  titleClassName = "",
  sticky = true,
  stickyTop = "top-32"
}) => {
  const content = (
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

  // Si sticky est activé, wrapper dans la section sticky
  if (sticky) {
    return (
      <div className={`work-header-section sticky ${stickyTop}`}>
        {content}
      </div>
    );
  }

  // Sinon, retourner le contenu sans sticky
  return content;
};

export default PageHeader; 