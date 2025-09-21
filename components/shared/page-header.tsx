import LastUpdated from "./last-updated";

interface PageHeaderProps {
  title: string;
  lastUpdated?: Date;
  children?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ 
  title, 
  lastUpdated, 
  children,
  className = "" 
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ${className}`}>
      <div className="min-w-0 flex-1">
        <div className="text-2xl sm:text-3xl font-medium truncate">{title}</div>
        <LastUpdated 
          timestamp={lastUpdated} 
          className="mt-1" 
          label="Data last updated"
        />
      </div>
      {children && (
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          {children}
        </div>
      )}
    </div>
  );
}
