import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  Icon: LucideIcon;
  className: string;
}

const FeatureCard = ({
  title,
  description,
  Icon,
  className,
}: FeatureCardProps) => {
  return (
    <div
      className={`flex flex-col items-start p-6 border rounded-md gap-6 shadow-xl ${className} flex-wrap`}
    >
      <div className="flex border border-gray-500 rounded-lg p-2">
        <Icon className="size-6" />
      </div>
      <h2 className="text-xl font-bold leading-normal">{title}</h2>
      <p className="text-sm leading-[20px]">{description}</p>
    </div>
  );
};

export default FeatureCard;
