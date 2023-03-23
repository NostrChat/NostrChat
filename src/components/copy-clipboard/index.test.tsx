import {render} from '@testing-library/react';

import CopyToClipboard from './index';

test('1 Default render', () => {
    const view = render(<CopyToClipboard copy="xxx11"><span>click here</span></CopyToClipboard>);
    expect(view.container).toMatchSnapshot();
});
