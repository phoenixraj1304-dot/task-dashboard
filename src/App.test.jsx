import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('Inventory dashboard', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shows inventory summary metrics and stock states', () => {
    render(<App />);

    expect(screen.getByText('Total products')).toBeInTheDocument();
    expect(screen.getByText('Inventory value')).toBeInTheDocument();
    expect(screen.getByText('Low-stock items')).toBeInTheDocument();
    expect(screen.getAllByText('Out of stock').length).toBeGreaterThan(1);
  });

  it('filters inventory by search term', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByPlaceholderText('Search by name, SKU or category'), 'planner');

    expect(screen.getByText('Daily Planner 2025')).toBeInTheDocument();
    expect(screen.queryByText('Aster Ceramic Mug')).not.toBeInTheDocument();
  });

  it('validates and adds an inventory item', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Add item' }));
    await user.click(screen.getAllByRole('button', { name: 'Add item' })[1]);
    expect(screen.getByText('Item name is required')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('e.g. Ceramic mug'), 'Stoneware Bowl');
    await user.type(screen.getByPlaceholderText('e.g. AST-MUG-01'), 'STN-BWL-07');
    await user.type(screen.getByPlaceholderText('e.g. Homeware'), 'Homeware');
    await user.type(screen.getByPlaceholderText('0'), '24');
    await user.type(screen.getByPlaceholderText('10'), '6');
    await user.type(screen.getByPlaceholderText('0.00'), '29.5');
    await user.click(screen.getAllByRole('button', { name: 'Add item' })[1]);

    expect(screen.getByText('Stoneware Bowl')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('task-dashboard-inventory'))).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Stoneware Bowl', quantity: 24 })]),
    );
  });
});
