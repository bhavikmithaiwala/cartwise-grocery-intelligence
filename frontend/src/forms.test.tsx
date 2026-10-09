// @vitest-environment jsdom
import {afterEach,expect,test,vi} from 'vitest';
import {render,screen,cleanup} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import {ReviewForm,blankReview} from './Review';
import {AuthScreen} from './Auth';
import {post} from './api';
vi.mock('./api',()=>({api:vi.fn().mockResolvedValue([]),post:vi.fn()}));
afterEach(()=>{cleanup();vi.clearAllMocks();});
test('human edits persist integer-cent totals and explicit reviewed lines',async()=>{
 const save=vi.fn();const user=userEvent.setup();render(<ReviewForm initial={blankReview()} onSave={save}/>);
 await user.type(screen.getByLabelText('Merchant'),'Fictional Store');await user.type(screen.getByLabelText('Purchase date'),'2026-10-09');
 await user.type(screen.getByLabelText('Item 1'),'Milk');
 const amount=screen.getByLabelText('Line total 1 (CAD)');await user.clear(amount);await user.type(amount,'3');
 await user.click(screen.getByRole('button',{name:'Save reviewed changes'}));
 expect(save).toHaveBeenCalledOnce();expect(save.mock.calls[0][0].lines[0]).toMatchObject({description:'Milk',lineTotalCents:300});
 await user.click(screen.getByRole('button',{name:'Add item'}));expect(screen.getByLabelText('Item 2')).toBeTruthy();
});
test('sign-in displays actionable API errors and does not navigate on failure',async()=>{
 vi.mocked(post).mockRejectedValueOnce(new Error('Email or password is incorrect.'));const user=userEvent.setup();
 render(<MemoryRouter><AuthScreen/></MemoryRouter>);await user.type(screen.getByLabelText('Email address'),'fictional@example.test');await user.type(screen.getByLabelText('Password'),'fictional-password');await user.click(screen.getByRole('button',{name:'Sign in'}));
 expect(await screen.findByRole('alert')).toHaveProperty('textContent','Email or password is incorrect.');
});
