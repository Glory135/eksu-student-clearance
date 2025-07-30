import { cn } from '@/lib/utils';
import React, { ReactNode } from 'react';

export default function MaxWidthWrapper({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				'mx-auto w-full max-w-screen px-2.5 md:px-10 xl:px-20',
				className
			)}>
			{children}
		</div>
	);
}
