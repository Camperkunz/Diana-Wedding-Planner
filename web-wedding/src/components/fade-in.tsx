'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface FadeInProps {
    children: React.ReactNode;
    className?: string;
    delay?: number; // Delay in milliseconds before the fade-in effect starts
    direction?: 'up' | 'down' | 'none';
}

export function FadeIn({
    children,
    className,
    delay = 0,
    direction = 'up',
}: FadeInProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (ref.current) observer.unobserve(ref.current);
                }
            },
            {
                threshold: 0.15, // Element will start appearing when it's visible 15% of the time
                rootMargin: '0px 0px -50px 0px',
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    const directionClasses = {
        up: 'translate-y-6',
        down: '-translate-y-6',
        none: 'translate-y-0',
    };

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={cn(
                'transition-all duration-700 ease-out',
                // Reduced motion: content is shown at once, without the slide.
                'motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0',
                isVisible
                    ? 'opacity-100 translate-y-0'
                    : `opacity-0 ${directionClasses[direction]}`,
                className
            )}
        >
            {children}
        </div>
    );
}