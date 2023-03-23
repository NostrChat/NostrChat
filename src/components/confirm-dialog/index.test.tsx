import {render} from '@testing-library/react';

import ConfirmDialog from './index';

test('1 Default render', () => {
    const view = render(<ConfirmDialog onConfirm={()=>{}} />);
    expect(view.container).toMatchSnapshot()
});

