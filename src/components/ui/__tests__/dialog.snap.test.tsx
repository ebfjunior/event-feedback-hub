import React from 'react';
import { render } from '@testing-library/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../dialog';

vi.mock('lucide-react', async () => {
	const actual = await vi.importActual<any>('lucide-react');
	return { ...actual, XIcon: (p: any) => <svg data-icon="x" {...p} /> };
});

describe('ui/Dialog (snapshot)', () => {
	it('renders portal content when open', () => {
		render(
			<Dialog open>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Title</DialogTitle>
					</DialogHeader>
				</DialogContent>
			</Dialog>,
		);
		expect(document.body).toMatchSnapshot();
	});
});


