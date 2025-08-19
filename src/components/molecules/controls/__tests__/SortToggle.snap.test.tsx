import React from 'react';
import { render } from '@testing-library/react';
import { SortToggle } from '../SortToggle';

describe('SortToggle (snapshot)', () => {
	it('renders', () => {
		const { container } = render(<SortToggle value="newest" onChange={() => {}} />);
		expect(container.firstChild).toMatchSnapshot();
	});
});


