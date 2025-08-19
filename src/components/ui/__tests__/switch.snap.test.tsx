import React from 'react';
import { render } from '@testing-library/react';
import { Switch } from '../switch';

describe('ui/Switch (snapshot)', () => {
	it('renders', () => {
		const { container } = render(<Switch />);
		expect(container.firstChild).toMatchSnapshot();
	});
});


