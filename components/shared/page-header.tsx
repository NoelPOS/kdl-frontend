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
    <div className={`flex items-center justify-center mb-6 ${className}`}>
      <div className="flex items-center justify-around w-full gap-4">
        <div className="flex-1/4">
          <div className="text-3xl font-medium">{title}</div>
          <LastUpdated 
            timestamp={lastUpdated} 
            className="mt-1" 
            label="Data last updated"
          />
        </div>
        {children && (
          <div className="flex gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
