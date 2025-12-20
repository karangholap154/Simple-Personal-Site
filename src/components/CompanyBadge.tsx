interface CompanyBadgeProps {
    name: string;
    icon?: string;
  }
  
  const CompanyBadge = ({ name, icon }: CompanyBadgeProps) => {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-secondary rounded text-sm text-foreground">
        {icon && <span className="text-xs">{icon}</span>}
        {name}
      </span>
    );
  };
  
  export default CompanyBadge;
  