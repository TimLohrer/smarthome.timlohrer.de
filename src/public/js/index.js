const ws = new WebSocket(`wss://api.smarthome.timlohrer.de`);

let DATA;

async function build() {
    if (USER_DATA.editingMode) {
        USER_DATA.editingMode = false;
    }
    let groups = await fetch('{{api}}/groups');
    if (!groups.ok) {
        return alert(groups.statusText);
    }
    groups = await groups.json();
    let _groups = {};
    groups.forEach(group => _groups[group.group ? group.group.instanceId : group.instanceId] = group);

    let devices = await fetch('{{api}}/devices');
    if (!devices.ok) {
        return alert(devices.statusText);
    }
    devices = await devices.json();
    let _devices = {};
    devices.forEach(device => {
        _devices[device.instanceId ?? device.id] = device;
    });
    DATA = {
        groups: _groups,
        devices: _devices
    }

    groups.forEach(group => {
        group.onOff = false;
        group.toggleDevices.forEach(d => {
            if (DATA.devices[d]?.type == -1) {  
                if (DATA.devices[d].output == true) {
                    group.onOff = true;
                }
            } else if (DATA.devices[d]?.type == -2) {
                if (DATA.devices[d].switch0 == true || DATA.devices[d].switch1 == true) {
                    group.onOff = true;
                }
            }
        });
        group.noChildren = group.devices.length < 2;
        document.getElementById('ROOT').innerHTML += group_component(group);
    });
    if ((await checkForPermissions(['2587fc3d-7581-461b-8452-ed689e9c198e', '00000000-0000-0000-0000-000000000000']))) {
        document.getElementById('ROOT').innerHTML += group_unassignedDevices_component();
    }
    ws.onmessage = async message => {
        message = JSON.parse(message.data);
        if (message.type == 'device updated') {
            if (message.device.type == -2) {
                if (message.device.mode == 'roller') {
                    updateRollerData(message.device);
                } else if (message.device.mode == 'switch') {
                    update2SwitchData(message.device);
                }
            } else if (message.device.type == -1) {
                update1Data(message.device);
            } else if (message.device.type == 0) {
                updateRemoteData(message.device);
            } else if (message.device.type == 2) {
                updateLightData(message.device);
            }
        }
    };
}

function toggleEdetingMode() {
    USER_DATA.editingMode = !USER_DATA.editingMode;
    closeGroup();
}

function updateRemoteData(device) {
    DATA.devices[device.instanceId] = device;
    if (!document.getElementById(`device-${device.instanceId}`)) {
        return;
    }
    document.getElementById(`device-${device.instanceId}-name`).innerHTML = device.name.length == 0 ? device.deviceInfo.modelNumber.length > 0 ? device.deviceInfo.modelNumber : 'Unknown Remote' : device.name.length <= 20 ? device.name : device.name.substring(0, 20 - 3) + '...';
    document.getElementById(`device-${device.instanceId}-alive`).innerHTML = device.alive ? 'Active' : 'Inactive';
    if (document.getElementById(`device-${device.instanceId}-alive`).classList.contains('active') && !device.alive) {
        document.getElementById(`device-${device.instanceId}-alive`).classList.add('inactive');
        document.getElementById(`device-${device.instanceId}-alive`).classList.remove('active');
    } else if (document.getElementById(`device-${device.instanceId}-alive`).classList.contains('inactive') && device.alive) {
        document.getElementById(`device-${device.instanceId}-alive`).classList.add('active');
        document.getElementById(`device-${device.instanceId}-alive`).classList.remove('inactive');
    }
}

function updateLightData(device) {
    DATA.devices[device.instanceId] = device;
    if (!document.getElementById(`device-${device.instanceId}`)) {
        return;
    }
    document.getElementById(`device-${device.instanceId}-name`).innerHTML = device.name.length == 0 ? device.deviceInfo.modelNumber.length > 0 ? device.deviceInfo.modelNumber : 'Unknown Light' : device.name.length <= 20 ? device.name : device.name.substring(0, 20 - 3) + '...';
    document.getElementById(`device-${device.instanceId}-alive`).innerHTML = device.alive ? 'Active' : 'Inactive';
    if (document.getElementById(`device-${device.instanceId}-alive`).classList.contains('active') && !device.alive) {
        document.getElementById(`device-${device.instanceId}-alive`).classList.add('inactive');
        document.getElementById(`device-${device.instanceId}-alive`).classList.remove('active');
    } else if (document.getElementById(`device-${device.instanceId}-alive`).classList.contains('inactive') && device.alive) {
        document.getElementById(`device-${device.instanceId}-alive`).classList.add('active');
        document.getElementById(`device-${device.instanceId}-alive`).classList.remove('inactive');
    }
    document.getElementById(`device-${device.instanceId}-onOff`).innerHTML = device.alive && device.lightList[0].onOff ? 'Turn Off' : 'Turn On';
    document.getElementById(`device-${device.instanceId}-onOff`).setAttribute('value', device.alive && device.lightList[0].onOff );
    if (device.alive && device.lightList[0].onOff) {
        document.getElementById(`device-${device.instanceId}-onOff`).classList.add('on');
        document.getElementById(`device-${device.instanceId}-onOff`).classList.remove('off');
    } else {
        document.getElementById(`device-${device.instanceId}-onOff`).classList.add('off');
        document.getElementById(`device-${device.instanceId}-onOff`).classList.remove('on');
    }
    document.getElementById(`device-${device.instanceId}-onOff`).disabled = !device.alive;
    document.getElementById(`device-${device.instanceId}-dimmer`).setAttribute('value', parseInt(device.lightList[0].dimmer));
    document.getElementById(`device-${device.instanceId}-dimmer`).disabled = !device.alive || !device.lightList[0].onOff;
    document.getElementById(`device-${device.instanceId}-dimmer-label`).innerHTML = parseInt(device.lightList[0].dimmer) + '%';
    if (!device.alive || !device.lightList[0].onOff) {
        document.getElementById(`device-${device.instanceId}-dimmer-label`).classList.add('disabled');
    } else {
        document.getElementById(`device-${device.instanceId}-dimmer-label`).classList.remove('disabled');
    }
    if (!device.alive || !device.lightList[0].onOff) {
        document.getElementById(`device-${device.instanceId}-color-wrapper`).classList.add('disabled');
    } else {
        document.getElementById(`device-${device.instanceId}-color-wrapper`).classList.remove('disabled');
    }
    document.getElementById(`device-${device.instanceId}-color-cold`).disabled = !device.alive || !device.lightList[0].onOff;
    if (device.lightList[0].colorTemperature == 0) {
        document.getElementById(`device-${device.instanceId}-color-cold`).classList.add('active');
        document.getElementById(`device-${device.instanceId}-color-cold`).classList.remove('inactive');
    } else {
        document.getElementById(`device-${device.instanceId}-color-cold`).classList.add('inactive');
        document.getElementById(`device-${device.instanceId}-color-cold`).classList.remove('active');
    }
    document.getElementById(`device-${device.instanceId}-color-normal`).disabled = !device.alive || !device.lightList[0].onOff;
    if (device.lightList[0].colorTemperature == 40.2) {
        document.getElementById(`device-${device.instanceId}-color-normal`).classList.add('active');
        document.getElementById(`device-${device.instanceId}-color-normal`).classList.remove('inactive');
    } else {
        document.getElementById(`device-${device.instanceId}-color-normal`).classList.add('inactive');
        document.getElementById(`device-${device.instanceId}-color-normal`).classList.remove('active');
    }
    document.getElementById(`device-${device.instanceId}-color-warm`).disabled = !device.alive || !device.lightList[0].onOff;
    if (device.lightList[0].colorTemperature == 100) {
        document.getElementById(`device-${device.instanceId}-color-warm`).classList.add('active');
        document.getElementById(`device-${device.instanceId}-color-warm`).classList.remove('inactive');
    } else {
        document.getElementById(`device-${device.instanceId}-color-warm`).classList.add('inactive');
        document.getElementById(`device-${device.instanceId}-color-warm`).classList.remove('active');
    }
}

async function update1Data(device) {
    DATA.devices[device.id] = device;
    let update = 0;
    let group;
    Object.values(DATA.groups).forEach(_group => {
        if (_group.devices.includes(device.id)) {
            if (_group.toggleDevices.includes(device.id)) {
                if (device.output == true) {
                    let allOff = true;
                    _group.toggleDevices.forEach(_d => {
                        if (!_d == device.id)
                        if (DATA.devices[_d].output == true) {
                            allOff = false;
                        }
                    });
                    if (allOff) {
                        update = 2;
                        group = _group;
                    }
                } else {
                    update = 2;
                    group = _group;
                }
            } else {
                update = 1;
            }
        }
    });
    if (update == 1) {
        if (!document.getElementById(`device-${device.id}`)) {
            return;
        }
        document.getElementById(`device-${device.id}-name`).innerHTML = device.name.length <= 20 ? device.name : device.name.substring(0, 20 - 3) + '...';
        document.getElementById(`device-${device.id}-relay`).innerHTML = device.output ? 'Turn Off' : 'Turn On';
        document.getElementById(`device-${device.id}-relay`).setAttribute('value', device.output);
        if (device.relay0) {
            document.getElementById(`device-${device.id}-relay`).classList.add('on');
            document.getElementById(`device-${device.id}-relay`).classList.remove('off');
        } else {
            document.getElementById(`device-${device.id}-relay`).classList.add('off');
            document.getElementById(`device-${device.id}-relay`).classList.remove('on');
        }
    } else if (update == 2) {
        if (!document.getElementById(`group-${group.instanceId}`)) {
            return;
        }
        document.getElementById(`group-${group.instanceId}-onOff`).innerHTML = device.output ? 'Turn Off' : 'Turn On';
        document.getElementById(`group-${group.instanceId}-onOff`).setAttribute('value', device.output);
        if (device.output) {
            document.getElementById(`group-${group.instanceId}-onOff`).classList.add('on');
            document.getElementById(`group-${group.instanceId}-onOff`).classList.remove('off');
        } else {
            document.getElementById(`group-${group.instanceId}-onOff`).classList.add('off');
            document.getElementById(`group-${group.instanceId}-onOff`).classList.remove('on');
        }
    }
}

function updateRollerData(device) {
    DATA.devices[device.id] = device;
    if (!document.getElementById(`device-${device.id}`)) {
        return;
    }
    document.getElementById(`device-${device.id}-name`).innerHTML = device.name.length <= 20 ? device.name : device.name.substring(0, 20 - 3) + '...';
    if (device.state == 'opening') {
        document.getElementById(`device-${device.id}-controll-opening`).classList.add('active');
        document.getElementById(`device-${device.id}-controll-opening`).classList.remove('inactive');
    } else {
        document.getElementById(`device-${device.id}-controll-opening`).classList.add('inactive');
        document.getElementById(`device-${device.id}-controll-opening`).classList.remove('active');
    }
    if (device.state == 'stopped' || device.state == 'open' || device.state == 'closed') {
        document.getElementById(`device-${device.id}-controll-stopped`).classList.add('active');
        document.getElementById(`device-${device.id}-controll-stopped`).classList.remove('inactive');
    } else {
        document.getElementById(`device-${device.id}-controll-stopped`).classList.add('inactive');
        document.getElementById(`device-${device.id}-controll-stopped`).classList.remove('active');
    }
    if (device.state == 'closing') {
        document.getElementById(`device-${device.id}-controll-closing`).classList.add('active');
        document.getElementById(`device-${device.id}-controll-closing`).classList.remove('inactive');
    } else {
        document.getElementById(`device-${device.id}-controll-closing`).classList.add('inactive');
        document.getElementById(`device-${device.id}-controll-closing`).classList.remove('active');
    }
    if (device.current_pos) {
        document.getElementById(`device-${device.id}-position`).value = parseInt(device.current_pos);
        document.getElementById(`device-${device.id}-position-label`).innerHTML = device.state != 'stopped' && device.state != 'open' && device.state != 'closed' ? '...%' : device.current_pos + '%';
    }
    document.getElementById(`device-${device.id}-position`).disabled = device.state != 'stopped' && device.state != 'open' && device.state != 'closed';
    if (device.state != 'stopped' && device.state != 'open' && device.state != 'closed') {
        document.getElementById(`device-${device.id}-position-label`).classList.add('disabled');
    } else {
        document.getElementById(`device-${device.id}-position-label`).classList.remove('disabled');
    }
}

function update2SwitchData(device) {
    let update = 0;
    let group;
    Object.values(DATA.groups).forEach(_group => {
        if (_group.devices.includes(device.id)) {
            if (_group.toggleDevices.includes(device.id)) {
                if (device.output == true) {
                    let allOff = true;
                    _group.toggleDevices.forEach(_d => {
                        if (!_d == device.id)
                        if (DATA.devices[_d].switch0 == true || DATA.devices[_d].switch1 == true) {
                            allOff = false;
                        }
                    });
                    if (allOff) {
                        update = 2;
                        group = _group;
                    }
                } else {
                    update = 2;
                    group = _group;
                }
            } else {
                update = 1;
            }
        }
    });
    if (update == 1) {
        if (!document.getElementById(`device-${device.id}`)) {
            return;
        }
        document.getElementById(`device-${device.id}-name`).innerHTML = device.name.length <= 20 ? device.name : device.name.substring(0, 20 - 3) + '...';
        document.getElementById(`device-${device.id}-relay0`).innerHTML = device.switch0.output ? 'Turn Off' : 'Turn On';
        document.getElementById(`device-${device.id}-relay0`).setAttribute('value', device.switch0.output);
        document.getElementById(`device-${device.id}-relay1`).innerHTML = device.switch1.output ? 'Turn Off' : 'Turn On';
        document.getElementById(`device-${device.id}-relay1`).setAttribute('value', device.switch1.output);
        if (device.switch0.output) {
            document.getElementById(`device-${device.id}-relay0`).classList.add('on');
            document.getElementById(`device-${device.id}-relay0`).classList.remove('off');
        } else {
            document.getElementById(`device-${device.id}-relay0`).classList.add('off');
            document.getElementById(`device-${device.id}-relay0`).classList.remove('on');
        }
        if (device.switch1.output) {
            document.getElementById(`device-${device.id}-relay1`).classList.add('on');
            document.getElementById(`device-${device.id}-relay1`).classList.remove('off');
        } else {
            document.getElementById(`device-${device.id}-relay1`).classList.add('off');
            document.getElementById(`device-${device.id}-relay1`).classList.remove('on');
        }
    } else if (update == 2) {
        if (!document.getElementById(`group-${group.instanceId}`)) {
            return;
        }
        document.getElementById(`group-${group.instanceId}-onOff`).innerHTML = device.output ? 'Turn Off' : 'Turn On';
        document.getElementById(`group-${group.instanceId}-onOff`).setAttribute('value', device.switch0 || device.switch1);
        if (device.output) {
            document.getElementById(`group-${group.instanceId}-onOff`).classList.add('on');
            document.getElementById(`group-${group.instanceId}-onOff`).classList.remove('off');
        } else {
            document.getElementById(`group-${group.instanceId}-onOff`).classList.add('off');
            document.getElementById(`group-${group.instanceId}-onOff`).classList.remove('on');
        }
    }
}

async function checkForPermissions(requiresRoles) {
    let user = await fetch(`${API}/accounts/${USER_DATA.id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${USER_DATA.accessToken}`
        }
    });
    if (!user.ok) {
        alert(user.statusText);
        return false;
    }
    user = await user.json();
    let hasPermission = false;
    requiresRoles.forEach(role => {
        if (user.roles.includes(role)) {
            hasPermission = true;
        }
    });
    if (!hasPermission) {
        return false;
    }
    return true;
}


// open group
function openGroup(instanceId) {
    if (instanceId == '000000') {
        let devices = [];
        Object.values(DATA.devices).forEach(device => {
            let found = false;
            Object.values(DATA.groups).forEach(group => {
                if (group.devices.includes(device.instanceId?.toString()) || group.devices.includes(device.id?.toString())) {
                    found = true;
                }
            });
            if (!found) {
                devices.push(device);
            }
        });
        let _devices = [];
        devices.forEach(device => {
            if (device.type == -2) {
                if (device.mode == 'roller') {
                    _devices.push(device_roller_component(device));
                }
            } else if (device.type == -1) {
                device.relayValue = device.output;
                _devices.push(device_1_component(device));
            } else if (device.type == 0) {
                _devices.push(device_remote_component(device, USER_DATA));
            } else if (device.type == 2) {
                _devices.push(device_light_component(device, USER_DATA));
            }
        });
        document.getElementById('ROOT').innerHTML = group_title_unassignedDevices_component(_devices);
    } else {
        let group = DATA.groups[instanceId];
        let _devices = [];
        group.devices.forEach(device => {
            const _device = DATA.devices[device];
            console.log(_device);
            if (!_device || ((group.toggleDevices.includes(_device.id) && (_device.type != -2 || _device.mode == 'roller')))) {
                return;
            } else if (_device.type == -2) {
                if (_device.mode == 'roller') {
                    _devices.push(device_roller_component(_device));
                } else if (_device.mode == 'switch') {
                    _devices.push(device_2_switch_component(_device));
                }
            } else if (_device.type == -1) {
                _device.relayValue = _device.output;
                _devices.push(device_1_component(_device));
            } if (_device.type == 0) {
                _devices.push(device_remote_component(_device, USER_DATA));
            } else if (_device.type == 2) {
                _devices.push(device_light_component(_device, USER_DATA));
            }
        });
        document.getElementById('ROOT').innerHTML = group_title_component(group, _devices);
    }
}

// close group
async function closeGroup() {
    let groups = [];
    Object.values(DATA.groups).forEach(group => {
        groups.push(group_component(group));
    });
    if ((await checkForPermissions(['34068695-26af-4344-b041-285370c65a89', '', '00000000-0000-0000-0000-000000000000']))) {
        groups.push(group_unassignedDevices_component());
    }
    document.getElementById('ROOT').innerHTML = groups.join('');
}

// operate group
async function operateGroup(instanceId, operation) {
    if (!(await checkForPermissions(['34068695-26af-4344-b041-285370c65a89', '2587fc3d-7581-461b-8452-ed689e9c198e', '00000000-0000-0000-0000-000000000000']))) {
        return;
    }
    DATA.groups[instanceId].toggleDevices.forEach(async d => {
        if (DATA.devices[d].type == -1) {
            const res = await fetch(`{{api}}/devices/shellies/1/${DATA.devices[d].model}-${d}/operate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'Application/json'
                },
                body: JSON.stringify(operation)
            });
            if (!res.ok) {
                return alert(res.statusText);
            }
        } else if (DATA.devices[d].type == -2 && DATA.devices[d].mode == 'switch') {
            const res1 = await fetch(`{{api}}/devices/shellies/2/${DATA.devices[d].model}-${d}/operate/switch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'Application/json'
                },
                body: JSON.stringify({ relay: 'switch0', value: operation.value })
            });
            if (!res1.ok) {
                return alert(res1.statusText);
            }
            const res2 = await fetch(`{{api}}/devices/shellies/2/${DATA.devices[d].model}-${d}/operate/switch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'Application/json'
                },
                body: JSON.stringify({ relay: 'switch1', value: operation.value })
            });
            if (!res2.ok) {
                return alert(res2.statusText);
            }
        }
    });
}

// update remote
async function updateRemote(instanceId) {
    const remote = DATA.devices[instanceId];
    const newName = prompt(`New name for "${remote.name}":`);
    if (!newName || !(await checkForPermissions(['2587fc3d-7581-461b-8452-ed689e9c198e', '00000000-0000-0000-0000-000000000000']))) {
        return;
    }
    const res = await fetch(`{{api}}/devices/remotes/${instanceId}/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'Application/json'
        },
        body: JSON.stringify({ name: newName })
    });
    if (!res.ok) {
        return alert(res.statusText);
    }
    updateRemoteData(await res.json());
}

//update light
async function updateLight(instanceId) {
    const device = DATA.devices[instanceId];
    const newName = prompt(`New name for "${device.name}":`);
    if (!newName || !(await checkForPermissions(['2587fc3d-7581-461b-8452-ed689e9c198e', '00000000-0000-0000-0000-000000000000']))) {
        return;
    }
    const res = await fetch(`{{api}}/devices/lights/${instanceId}/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'Application/json'
        },
        body: JSON.stringify({ name: newName })
    });
    if (!res.ok) {
        return alert(res.statusText);
    }
    updateLightData(await res.json());
}

// operate light
async function operateLight(instanceId, operation) {
    if (!(await checkForPermissions(['34068695-26af-4344-b041-285370c65a89', '2587fc3d-7581-461b-8452-ed689e9c198e', '00000000-0000-0000-0000-000000000000']))) {
        return;
    }
    const res = await fetch(`{{api}}/devices/lights/${instanceId}/operate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'Application/json'
        },
        body: JSON.stringify(operation)
    });
    if (!res.ok) {
        return alert(res.statusText);
    }
}

// operate roller
async function operateRoller(id, operation) {
    if (!(await checkForPermissions(['34068695-26af-4344-b041-285370c65a89', '2587fc3d-7581-461b-8452-ed689e9c198e', '00000000-0000-0000-0000-000000000000']))) {
        return;
    }
    if (operation.position) {
        document.getElementById(`device-${id}-position`).value = operation.position;
        document.getElementById(`device-${id}-position-label`).innerHTML = operation.position + '%';
    }
    const res = await fetch(`{{api}}/devices/shellies/2/${DATA.devices[id].model}-${id}/operate/roller`, {
        method: 'POST',
        headers: {
            'Content-Type': 'Application/json'
        },
        body: JSON.stringify(operation)
    });
    if (!res.ok) {
        return alert(res.statusText);
    }
}

// operate 2 switch
async function operate2Switch(id, operation) {
    if (!(await checkForPermissions(['34068695-26af-4344-b041-285370c65a89', '2587fc3d-7581-461b-8452-ed689e9c198e', '00000000-0000-0000-0000-000000000000']))) {
        return;
    }
    console.log(operation);
    const res = await fetch(`{{api}}/devices/shellies/2/${DATA.devices[id].model}-${id}/operate/switch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'Application/json'
        },
        body: JSON.stringify(operation)
    });
    if (!res.ok) {
        return alert(res.statusText);
    }
}

// operate 1
async function operate1(id, operation) {
    if (!(await checkForPermissions(['34068695-26af-4344-b041-285370c65a89', '2587fc3d-7581-461b-8452-ed689e9c198e', '00000000-0000-0000-0000-000000000000']))) {
        return;
    }
    const res = await fetch(`{{api}}/devices/shellies/1/${id}/operate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'Application/json'
        },
        body: JSON.stringify(operation)
    });
    if (!res.ok) {
        return alert(res.statusText);
    }
}