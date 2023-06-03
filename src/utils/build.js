const fs = require('fs');
const { url, api } = require('../config/config.json');

module.exports = function build (name, replacements = {}) {
    // build html
    let html = fs.readFileSync(`${__dirname}/../public/html/${name}.html`, 'utf-8').replaceAll('{{url}}', url).replaceAll('{{api}}', api);
    if (replacements) {
        Object.entries(replacements).forEach(replacement => {
            html = html.replaceAll(`{{ ${replacement[0]} }}`, replacement[1]);
        });
    }
    
    // fetch css file
    let css = '/* NO CSS FILE */';
    try {
        css = fs.readFileSync(`${__dirname}/../public/css/${name}.css`, 'utf-8');
    } catch (err) {}
    
    // build js file
    let js = '// NO JS FILE //';
    try {
        js = fs.readFileSync(`${__dirname}/../public/js/${name}.js`, 'utf-8').replaceAll('{{url}}', url).replaceAll('{{api}}', api);
        if (replacements) {
            Object.entries(replacements).forEach(replacement => {
                js = js.replaceAll(`{{ ${replacement[0]} }}`, replacement[1]);
            });
        }
    } catch (err) {}

    // build server components
    fs.readdirSync(`${__dirname}/../public/html/components/server`).forEach(component => {
        let _component = fs.readFileSync(`${__dirname}/../public/html/components/server/${component}`, 'utf-8').replaceAll('{{ url }}', url);
        if (replacements) {
            Object.entries(replacements).forEach(replacement => {
                _component = _component.replaceAll(`{{ ${replacement[0]} }}`, replacement[1]);
            });
        }
        html = html.replaceAll(`{{{ ${component.split('.')[0]} }}}`, _component);
    });

    // build global files
    let global_css = '';
    fs.readdirSync(`${__dirname}/../public/css/global`).forEach(file => {
        global_css += `<style GLOBAL="${file}">\n${fs.readFileSync(`${__dirname}/../public/css/global/${file}`, 'utf-8')}\n</style>\n`;
    });
    let global_js = ''
    fs.readdirSync(`${__dirname}/../public/js/global`).forEach(file => {
        global_js += `<script GLOBAL="${file}">\n${fs.readFileSync(`${__dirname}/../public/js/global/${file}`, 'utf-8').replaceAll('{{url}}', url).replaceAll('{{api}}', api)}\n</script>\n`;
    })

    // return built site
    return `${html}${css ? `\n<style>\n${css}\n</style>` : ''}${js ? `\n<script defer>\n${js}\n</script>` : ''}${global_css ? `\n${global_css}` : ''}${global_js ? `\n${global_js}` : ''}`;
}