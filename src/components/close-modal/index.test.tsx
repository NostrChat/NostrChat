import {render} from '@testing-library/react';

import CloseModal from './index';

test('1 Default render', () => {
    const view = render(<CloseModal onClick={() => {
    }}/>);
    expect(view.container).toMatchSnapshot()
});

