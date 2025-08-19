import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ErrorBanner } from '../ErrorBanner';

describe('ErrorBanner (snapshot)', () => {
	it('renders and triggers retry', () => {
		const onRetry = vi.fn();
		const { container, getByText } = render(<ErrorBanner message="Failed" onRetry={onRetry} />);
		expect(container.firstChild).toMatchSnapshot();
		fireEvent.click(getByText('Retry'));
		expect(onRetry).toHaveBeenCalled();
	});
});


