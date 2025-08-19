import React from 'react';
import { render } from '@testing-library/react';
import { FeedbackCard } from '../FeedbackCard';

vi.mock('next/link', () => ({ default: (props: any) => <a {...props} /> }));
vi.mock('@/components/atoms/Stars', () => ({
	Stars: ({ rating }: { rating: number }) => <div data-stars>{rating}</div>,
}));

const base = {
	id: '1',
	event_id: 'e1',
	event_name: 'Event 1',
	rating: 4,
	text: 'Great event',
	created_at: new Date('2024-01-01T00:10:00Z').toISOString(),
};

describe('FeedbackCard (snapshot)', () => {
	it('renders highlighted', () => {
		const { container } = render(<FeedbackCard feedback={base} highlight />);
		expect(container.firstChild).toMatchSnapshot();
	});

	it('renders non-highlighted', () => {
		const { container } = render(<FeedbackCard feedback={base} />);
		expect(container.firstChild).toMatchSnapshot();
	});
});


