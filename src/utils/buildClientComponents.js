const fs = require('fs');

module.exports = (url) => {
    let components = '';
    fs.readdirSync(`${__dirname}/../public/html/components/client`).forEach(component => {
        let _component = fs.readFileSync(`${__dirname}/../public/html/components/client/${component}`, 'utf-8').replaceAll('{{ url }}', url);
        let args = [];
        _component.split('{{ ').slice(1).forEach(arg => {
            arg = arg.split(' }}')[0];
            _component = _component.replaceAll(`{{ ${arg} }}`, `\${${arg}}`).replaceAll('\n', '').replaceAll('>    <', '><');
            if (args.includes(arg) || args.includes(arg.split('.')[0])) { return; }
            args.push(arg.split('.')[0]);
        });
        components += `// ${component.split('.')[0]}\nconst ${component.split('.')[0]}_component = (${args.join(',')}) => { return \`${_component}\` };\n`;
    });
    fs.writeFileSync(`${__dirname}/../public/js/global/Components.js`, components, 'utf8');
}