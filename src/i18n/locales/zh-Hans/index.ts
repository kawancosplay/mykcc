import type { PartialLocaleDictionary } from '../../types';
import common from './common';
import auth from './auth';
import card from './card';
import registration from './registration';
import profile from './profile';
import gallery from './gallery';
import stats from './stats';
import siteEditor from './siteEditor';
import admin from './admin';
import demo from './demo';
import sheets from './sheets';
import errors from './errors';

const dictionary: PartialLocaleDictionary = { common, auth, card, registration, profile, gallery, stats, siteEditor, admin, demo, sheets, errors };

export default dictionary;
