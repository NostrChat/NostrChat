import React, {useEffect, useState} from 'react';
import Joi from 'joi';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import useTranslation from 'hooks/use-translation';
import PictureInput from 'views/components/picture-input';
import {Metadata} from 'types';

const MetadataForm = (props: {
    values?: Metadata,
    labels?: Metadata,
    submitBtnLabel: string,
    skipButton: React.ReactElement,
    onSubmit: (data: Metadata) => void,
    inProgress?: boolean
}) => {
    const {skipButton, submitBtnLabel, values, labels, onSubmit, inProgress} = props;
    const [name, setName] = useState(values?.name || '');
    const [about, setAbout] = useState(values?.about || '');
    const [picture, setPicture] = useState(values?.picture || '');
    const [t,] = useTranslation();
    const [error, setError] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [changed, setChanged] = useState(false);

    useEffect(()=>{
        if(values && !changed){
            setName(values.name);
            setAbout(values.about);
            setPicture(values.picture);
        }
    }, [values]);

    const resetError = () => {
        setError('');
        setErrorMessage('');
    }

    const nameChanged = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        resetError();
        setName(e.target.value);
        setChanged(true);
    };

    const aboutChanged = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        resetError();
        setAbout(e.target.value);
        setChanged(true);
    };

    const pictureChanged = (picture: string) => {
        resetError();
        setPicture(picture);
        setChanged(true);
    };

    const submit = () => {
        const scheme = Joi.object({
            name: Joi.string().required(),
            about: Joi.string().empty(''),
            picture: Joi.string().uri({scheme: 'https', allowRelative: false}).empty(''),
        }).messages({
            'string.uriCustomScheme': t('Picture must be a valid uri with a scheme matching the https pattern')
        });

        const metadata = {name, about, picture};
        const validation = scheme.validate(metadata);

        if (validation.error) {
            setError(validation.error.details[0].path[0].toString() || '');
            setErrorMessage(validation.error.details[0].message);
            return;
        }

        onSubmit(metadata);
    }

    return <>
        <TextField label={t(labels?.name || 'Name')} value={name} onChange={nameChanged} fullWidth autoFocus autoComplete="off"
                   error={error === 'name'} helperText={error === 'name' ? errorMessage : ' '}/>
        <TextField label={t(labels?.about || 'About')} value={about} onChange={aboutChanged} fullWidth autoComplete="off" helperText={' '}/>
        <PictureInput label={t(labels?.picture || 'Profile picture')} value={picture} onChange={pictureChanged}
                      error={error === 'picture' ? errorMessage : ''}/>
        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
            {skipButton ? skipButton : ''}
            <Button variant="contained" disabled={inProgress} onClick={submit}>{inProgress ? '...' : submitBtnLabel}</Button>
        </Box>
    </>
}

export default MetadataForm;
