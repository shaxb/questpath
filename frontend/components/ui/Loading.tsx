interface LoadingProps {
  fullPage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export default function Loading({ 
  fullPage = false, 
  size = 'md', 
  message 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div 
        className={`animate-spin rounded-full border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="text-gray-600 dark:text-gray-300 text-center animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        {content}
      </div>
    );
  }

  return content;
}
