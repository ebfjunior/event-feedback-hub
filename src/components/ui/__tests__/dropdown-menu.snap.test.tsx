import React from 'react';
import { render } from '@testing-library/react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '../dropdown-menu';

vi.mock('lucide-react', async () => {
	const actual = await vi.importActual<any>('lucide-react');
	return {
		...actual,
		CheckIcon: (p: any) => <svg data-icon="check" {...p} />,
		ChevronRightIcon: (p: any) => <svg data-icon="chev-right" {...p} />,
		CircleIcon: (p: any) => <svg data-icon="circle" {...p} />,
	};
});

describe('ui/DropdownMenu (snapshot)', () => {
	it('renders structure', () => {
		render(
			<DropdownMenu>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel>Label</DropdownMenuLabel>
					<DropdownMenuItem>Item</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>,
		);
		expect(document.body).toMatchSnapshot();
	});
});


