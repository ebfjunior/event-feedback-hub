import React from 'react';
import { render } from '@testing-library/react';
import { Textarea } from '../textarea';

describe('ui/Textarea (snapshot)', () => {
	it('renders', () => {
		const { container } = render(<Textarea placeholder="Write" />);
		expect(container.firstChild).toMatchSnapshot();
	});
});


