import {Capacitor} from '@capacitor/core';

type Platform = 'web' | 'ios' | 'android'

const usePlatform = (): Platform => Capacitor.getPlatform() as Platform;

export default usePlatform;
