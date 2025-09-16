interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({title, description}: PageHeaderProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
}
