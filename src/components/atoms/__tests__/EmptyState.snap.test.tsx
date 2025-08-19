import React from 'react';
import { render } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState (snapshot)', () => {
	it('renders with default message', () => {
		const { container } = render(<EmptyState />);
		expect(container.firstChild).toMatchSnapshot();
	});

	it('renders with custom message', () => {
		const { container } = render(<EmptyState message="Nothing here" />);
		expect(container.firstChild).toMatchSnapshot();
	});
});


