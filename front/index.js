// MARK: HTML outlets

stringInput = document.getElementById("stringInput");
hashInput = document.getElementById("hashInput");
stringOutput = document.getElementById("stringOutput");
hashOutput = document.getElementById("hashOutput");

// MARK: String to Hash

async function findHash(backendType) { // backendType = go | node
    hashOutput.innerHTML = "Loading..."
    const response = await fetch('http://localhost/' + backendType + '/sha', {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"string": stringInput.value})
    });
    const json = await response.json();
    if ((json.error != undefined) || json.result == undefined) {
        hashOutput.innerHTML = ""
        alert("Error: " + json.error);
        return;
    }
    hashOutput.innerHTML = json.result;
}

async function findHashGo() {
    await findHash('go')
}

async function findHashNode() {
    await findHash('node')
}

// MARK: Hash to String

async function findString(backendType) { // backendType = go | node
    stringOutput.innerHTML = "Loading..."
    const response = await fetch('http://localhost/' + backendType +
     '/sha?sha256=' + encodeURIComponent(hashInput.value), {
        method: 'GET',
    });
    const json = await response.json();
    if ((json.error != undefined) || json.result == undefined) {
        stringOutput.innerHTML = ""
        alert("Error: " + json.error);
        return;
    }
    stringOutput.innerHTML = json.result;
}

async function findStringGo() {
    await findString('go')
}

async function findStringNode() {
    await findString('node')
}