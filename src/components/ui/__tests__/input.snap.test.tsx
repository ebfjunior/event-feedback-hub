import React from 'react';
import { render } from '@testing-library/react';
import { Input } from '../input';

describe('ui/Input (snapshot)', () => {
	it('renders', () => {
		const { container } = render(<Input placeholder="Type" />);
		expect(container.firstChild).toMatchSnapshot();
	});
});


