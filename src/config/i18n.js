import i18n, { configure } from 'i18n';
import { join } from 'path';

configure({
    directory: join(__dirname, '/locales'),
    locales: ['vi', 'en']
});

export default i18n;
