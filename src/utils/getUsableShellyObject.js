module.exports = (shelly) => {
    let newShelly;
    if (shelly.id.split('-')[0] == 'shellyplus1pm') {
        newShelly = {
            id         : shelly.id.split('-')[1],
            name       : shelly.name,
            model      : shelly.id.split('-')[0],
            type       : -1,
            hostname   : shelly.wifi.sta_ip,
            output     : shelly.switch0.output,
            temperature: shelly.switch0.temperature.tC,
            apower     : shelly.switch0.apower,
            voltage    : shelly.switch0.voltage,
            current    : shelly.switch0.current,
            aenergy    : shelly.switch0.aenergy
        }
    } else if (shelly.id.split('-')[0] == 'shellyplus2pm') {
        if (shelly.profile == 'cover') {
            newShelly = {
                id         : shelly.id.split('-')[1],
                name       : shelly.name,
                model      : shelly.id.split('-')[0],
                type       : -2,
                mode       : 'roller',
                hostname   : shelly.wifi.sta_ip,
                state      : shelly.cover0.state,
                apower     : shelly.cover0.apower,
                voltage    : shelly.cover0.voltage,
                current    : shelly.cover0.current,
                pf         : shelly.cover0.pf,
                aenergy    : shelly.cover0.aenergy,
                current_pos: shelly.cover0.current_pos,
                target_pos : shelly.cover0.target_pos,
            }
        } else {
            newShelly = {
                id         : shelly.id.split('-')[1],
                name       : shelly.name,
                model      : shelly.id.split('-')[0],
                type       : -2,
                mode       : 'switch',
                hostname   : shelly.wifi.sta_ip,
                switch0    : {
                    name       : shelly.config['switch:0'].name ?? 'Switch 0',
                    output     : shelly.switch0.output,
                    temperature: shelly.switch0.temperature.tC,
                    apower     : shelly.switch0.apower,
                    voltage    : shelly.switch0.voltage,
                    current    : shelly.switch0.current,
                    pf         : shelly.switch0.pf,
                    aenergy    : shelly.switch0.aenergy
                },
                switch1    : {
                    name       : shelly.config['switch:1'].name ?? 'Switch 1',
                    output     : shelly.switch1.output,
                    temperature: shelly.switch1.temperature.tC,
                    apower     : shelly.switch1.apower,
                    voltage    : shelly.switch1.voltage,
                    current    : shelly.switch1.current,
                    pf         : shelly.switch1.pf,
                    aenergy    : shelly.switch1.aenergy
                }
            }
        }
    }
    return newShelly;
}