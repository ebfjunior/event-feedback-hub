import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { NewItemsBanner } from '../NewItemsBanner';

describe('NewItemsBanner (snapshot)', () => {
	it('renders when count > 0 and triggers onApply', () => {
		const onApply = vi.fn();
		const { container, getByText } = render(<NewItemsBanner count={3} onApply={onApply} />);
		expect(container.firstChild).toMatchSnapshot();
		fireEvent.click(getByText('Show'));
		expect(onApply).toHaveBeenCalled();
	});

	it('renders null when count <= 0', () => {
		const { container } = render(<NewItemsBanner count={0} onApply={() => {}} />);
		expect(container.firstChild).toBeNull();
	});
});


