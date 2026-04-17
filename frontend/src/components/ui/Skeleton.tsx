interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton = ({ className = '', variant = 'rectangular' }: SkeletonProps) => {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`
        animate-pulse bg-neutral-200
        ${variantStyles[variant]}
        ${className}
      `}
    />
  );
};

export const EventCardSkeleton = () => {
  return (
    <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-white p-6">
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-2 w-full mt-4" />
    </div>
  );
};
