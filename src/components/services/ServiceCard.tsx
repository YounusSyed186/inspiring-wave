import React from 'react';
import { ServiceItem } from './services-data';

interface ServiceCardProps {
  service: ServiceItem;
  onClick: (service: ServiceItem) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onClick,
  className = '',
  style = {},
}) => {
  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={`View ${service.title} details`}
      onClick={() => onClick(service)}
      style={style}
      className={`service-card ${className}`}
    >
      <h3>{service.title}</h3>
      <p>{service.tagline}</p>
    </article>
  );
};
