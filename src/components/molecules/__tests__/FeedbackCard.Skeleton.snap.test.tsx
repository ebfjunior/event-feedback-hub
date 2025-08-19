import React from 'react';
import { render } from '@testing-library/react';
import { FeedbackCardSkeleton } from '../FeedbackCard.Skeleton';

describe('FeedbackCardSkeleton (snapshot)', () => {
	it('renders', () => {
		const { container } = render(<FeedbackCardSkeleton />);
		expect(container.firstChild).toMatchSnapshot();
	});
});


