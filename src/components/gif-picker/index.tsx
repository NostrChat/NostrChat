import {useContext} from 'react';
import Box from '@mui/material/Box';
import {styled} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {Grid, SearchBar as DefaultSearchBar, SearchContext, SearchContextManager} from '@giphy/react-components'
import {IGif} from '@giphy/js-types'
import useStyles from 'hooks/use-styles';

const GIPHY_KEY = process.env.REACT_APP_GIPHY_KEY!;

export const SearchBar = styled(DefaultSearchBar)`
  ${() => {
    const theme = useTheme();
    return `
      background: transparent !important;
      border: none!important;
    
      div {
        display: none;
      }
      > input {
        padding: 0.625rem 1rem!important;
        color: ${theme.palette.text.primary}!important;
        background: ${theme.palette.background.paper} !important;
        border: none!important;
        outline: none;
        border-radius: ${theme.shape.borderRadius}px !important;
       
        ::placeholder {
            color: ${theme.palette.text.disabled}!important;
        }
      }
      .giphy-search-bar-cancel {
        position: absolute;
        inset-inline-end: 1.5rem;
      }`
  }}
`;

const Giphy = (props: { onSelect: (selected: string) => void }) => {
    const {fetchGifs, searchKey} = useContext(SearchContext);
    const styles = useStyles();

    const onClick = (e: IGif) => {
        props.onSelect(e.images.fixed_height.url);
    }

    return <>
        <Box sx={{mb: '6px'}}>
            <SearchBar placeholder="Search" autoFocus/>
        </Box>

        <Box sx={{
            height: '260px',
            ...styles.scrollY
        }}>
            <Grid
                tabIndex={1}
                key={searchKey}
                noLink
                columns={2}
                width={260}
                fetchGifs={fetchGifs}
                gutter={8}
                onGifClick={onClick}
                hideAttribution
                onGifKeyPress={onClick}
            />
        </Box>
    </>
}

const GifPicker = (props: { onSelect: (selected: string) => void }) => {
    return <Box sx={{p: '5px', height: '310px'}}>
        <SearchContextManager apiKey={GIPHY_KEY}>
            <Giphy onSelect={props.onSelect}/>
        </SearchContextManager>
    </Box>;
}

export default GifPicker;
