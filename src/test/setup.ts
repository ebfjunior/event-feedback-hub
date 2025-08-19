import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

// Stable system time for snapshots
// eslint-disable-next-line no-undef
vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));

// Basic DOM observers to avoid JSDOM crashes in components using them
class MockIntersectionObserver {
	root: Element | null = null;
	rootMargin = '';
	thresholds: ReadonlyArray<number> = [];
	observe() {}
	unobserve() {}
	disconnect() {}
	takeRecords(): IntersectionObserverEntry[] { return []; }
}

(globalThis as any).IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

class MockResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}
(globalThis as any).ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// next/link mock to render as a simple anchor for snapshots
// eslint-disable-next-line no-undef
vi.mock('next/link', () => {
	return {
		default: ({ href, children, ...props }: { href: string; children?: React.ReactNode }) =>
			React.createElement('a', { href, ...props }, children),
	};
});

