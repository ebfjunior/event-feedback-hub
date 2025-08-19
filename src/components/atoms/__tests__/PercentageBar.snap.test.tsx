import React from 'react';
import { render } from '@testing-library/react';
import { PercentageBar } from '../PercentageBar';

describe('PercentageBar (snapshot)', () => {
	it('renders clamped values', () => {
		const { container: c1 } = render(<PercentageBar value={-10} />);
		expect(c1.firstChild).toMatchSnapshot();
		const { container: c2 } = render(<PercentageBar value={50} />);
		expect(c2.firstChild).toMatchSnapshot();
		const { container: c3 } = render(<PercentageBar value={110} />);
		expect(c3.firstChild).toMatchSnapshot();
	});
});


